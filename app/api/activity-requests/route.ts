import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        parent: true,
        children: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let requests

    if (user.role === 'PARENT') {
      // Get all pending requests from children
      const childIds = user.children.map(child => child.id)
      requests = await prisma.activityRequest.findMany({
        where: {
          requestedById: { in: childIds },
          status: 'PENDING'
        },
        include: {
          requestedBy: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Get all requests for the kid
      requests = await prisma.activityRequest.findMany({
        where: { requestedById: user.id },
        include: {
          reviewedBy: true,
          point: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Failed to fetch activity requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || (user.role !== 'KID' && user.role !== 'PARENT')) {
      return NextResponse.json({ error: 'Only kids and parents can submit activity requests' }, { status: 403 })
    }

    const body = await request.json()
    const { activity, description, activityDate, childId } = body

    if (!activity || !description || !activityDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If user is a parent, they must specify which child, and it must be their child
    let requestedById = user.id
    if (user.role === 'PARENT') {
      if (!childId) {
        return NextResponse.json({ error: 'Child ID required for parent submissions' }, { status: 400 })
      }
      
      // Verify the child belongs to this parent
      const child = await prisma.user.findFirst({
        where: { 
          id: childId, 
          parentId: user.id,
          role: 'KID'
        }
      })
      
      if (!child) {
        return NextResponse.json({ error: 'Child not found or not yours' }, { status: 403 })
      }
      
      requestedById = child.id
    }

    const activityRequest = await prisma.activityRequest.create({
      data: {
        activity,
        description,
        activityDate: new Date(activityDate),
        requestedById: requestedById
      },
      include: {
        requestedBy: true
      }
    })

    return NextResponse.json(activityRequest)
  } catch (error) {
    console.error('Failed to create activity request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}