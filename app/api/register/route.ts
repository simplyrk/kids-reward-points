import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, password, name, role, parentId, childUsername } = await req.json()

    // Validate input
    if (!password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // For parents, email is required and must be unique
    if (role === "PARENT") {
      if (!email) {
        return NextResponse.json(
          { error: "Email is required for parents" },
          { status: 400 }
        )
      }

      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 }
        )
      }
    }

    // For children, childUsername is required and must be unique
    if (role === "KID") {
      if (!childUsername) {
        return NextResponse.json(
          { error: "Username is required for children" },
          { status: 400 }
        )
      }

      const existingChild = await prisma.user.findUnique({
        where: { childUsername }
      })

      if (existingChild) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        )
      }
    }

    // If registering a kid, verify parent exists
    if (role === "KID" && parentId) {
      const parent = await prisma.user.findUnique({
        where: { id: parentId, role: "PARENT" }
      })

      if (!parent) {
        return NextResponse.json(
          { error: "Invalid parent ID" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: role === "PARENT" ? email : null,
        password: hashedPassword,
        name,
        role,
        parentId: role === "KID" ? parentId : null,
        childUsername: role === "KID" ? childUsername : null,
        plainPassword: role === "KID" ? password : null, // Store plain password for children only
        avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${role === "KID" ? childUsername : email}`
      }
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
