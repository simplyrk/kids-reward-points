import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await the params
    const { id } = await params

    // Verify user is a parent
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Access denied - parent role required' }, { status: 403 })
    }

    // Verify the child belongs to this parent
    const child = await prisma.user.findFirst({
      where: {
        id: id,
        parentId: session.user.id,
        role: 'KID'
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Delete the child - this will cascade delete all related records
    // (points, activity requests, etc.) due to onDelete: Cascade in schema
    await prisma.user.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting child:', error)
    return NextResponse.json(
      { error: 'Failed to delete child' },
      { status: 500 }
    )
  }
}