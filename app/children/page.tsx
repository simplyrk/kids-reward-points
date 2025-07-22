import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import ChildrenClient from './ChildrenClient'

export default async function ChildrenPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      children: {
        include: {
          points: {
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  })

  if (!user || user.role !== 'PARENT') {
    redirect('/dashboard')
  }

  return <ChildrenClient user={user} />
}