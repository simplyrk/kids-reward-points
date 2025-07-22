import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET all points for a user or their children
export async function GET(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  try {
    let points

    if (session.user.role === "PARENT") {
      // Optimized single query for parent's children points
      const parent = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          children: {
            include: {
              points: {
                where: userId ? { userId } : undefined,
                include: {
                  user: {
                    select: { name: true, email: true, avatar: true }
                  },
                  givenBy: {
                    select: { name: true, email: true }
                  }
                },
                orderBy: { createdAt: "desc" },
                take: 50 // Limit for performance
              }
            }
          }
        }
      })
      
      // Flatten points from all children
      points = parent?.children.flatMap(child => child.points) || []
    } else {
      // Kids can only see their own points
      points = await prisma.point.findMany({
        where: { userId: session.user.id },
        include: {
          user: {
            select: { name: true, email: true, avatar: true }
          },
          givenBy: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    }

    return NextResponse.json(points)
  } catch (error) {
    console.error("Error fetching points:", error)
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    )
  }
}

// POST create new points (only parents can do this)
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { userId, amount, description } = await req.json()

    // Validate amount (allow negative values for penalties)
    if (!amount || isNaN(amount)) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      )
    }

    // Verify the user is a child of this parent
    const child = await prisma.user.findFirst({
      where: {
        id: userId,
        parentId: session.user.id
      }
    })

    if (!child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      )
    }

    const point = await prisma.point.create({
      data: {
        userId,
        amount,
        description,
        givenById: session.user.id
      },
      include: {
        user: {
          select: { name: true, email: true, avatar: true }
        },
        givenBy: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(point)
  } catch (error) {
    console.error("Error creating points:", error)
    return NextResponse.json(
      { error: "Failed to create points" },
      { status: 500 }
    )
  }
}

// DELETE points (only parents can do this)
export async function DELETE(req: Request) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const pointId = searchParams.get("id")

  if (!pointId) {
    return NextResponse.json(
      { error: "Point ID required" },
      { status: 400 }
    )
  }

  try {
    // Verify the point belongs to a child of this parent
    const point = await prisma.point.findFirst({
      where: {
        id: pointId,
        givenById: session.user.id
      }
    })

    if (!point) {
      return NextResponse.json(
        { error: "Point not found" },
        { status: 404 }
      )
    }

    await prisma.point.delete({
      where: { id: pointId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting point:", error)
    return NextResponse.json(
      { error: "Failed to delete point" },
      { status: 500 }
    )
  }
}
