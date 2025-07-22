import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { children: true }
    })

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Only parents can review activity requests' }, { status: 403 })
    }

    const body = await request.json()
    const { status, points } = body

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (status === 'APPROVED' && (!points || points === 0)) {
      return NextResponse.json({ error: 'Points required for approval' }, { status: 400 })
    }

    const resolvedParams = await params
    
    // Get the request to verify it belongs to one of the parent's children
    const activityRequest = await prisma.activityRequest.findUnique({
      where: { id: resolvedParams.id },
      include: { requestedBy: true }
    })

    if (!activityRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Verify the request is from one of the parent's children
    const childIds = user.children.map(child => child.id)
    if (!childIds.includes(activityRequest.requestedById)) {
      return NextResponse.json({ error: 'Unauthorized to review this request' }, { status: 403 })
    }

    if (activityRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already reviewed' }, { status: 400 })
    }

    let pointRecord = null

    // If approved, create the points record
    if (status === 'APPROVED') {
      pointRecord = await prisma.point.create({
        data: {
          amount: points,
          description: `${activityRequest.activity} - ${activityRequest.description}`,
          userId: activityRequest.requestedById,
          givenById: user.id
        }
      })
    }

    // Update the activity request
    const updatedRequest = await prisma.activityRequest.update({
      where: { id: resolvedParams.id },
      data: {
        status,
        reviewedById: user.id,
        reviewedAt: new Date(),
        pointId: pointRecord?.id
      },
      include: {
        requestedBy: true,
        reviewedBy: true,
        point: true
      }
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Failed to review activity request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}