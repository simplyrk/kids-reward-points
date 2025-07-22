import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a parent
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Access denied - parent role required' }, { status: 403 })
    }

    // Get children credentials (username and plain password for viewing)
    const children = await prisma.user.findMany({
      where: {
        parentId: session.user.id,
        role: 'KID'
      },
      select: {
        id: true,
        name: true,
        childUsername: true,
        plainPassword: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ children })
  } catch (error) {
    console.error('Error fetching children credentials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch children credentials' },
      { status: 500 }
    )
  }
}