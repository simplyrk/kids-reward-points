'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/app/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Star, 
  Plus, 
  Trophy, 
  TrendingUp,
  LogOut,
  Users,
  Gift,
  Calendar,
  Zap,
  Award,
  Target,
  Sparkles,
  ChevronRight,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Point {
  id: string
  amount: number
  description: string | null
  createdAt: string
}

interface Child {
  id: string
  name: string
  email: string
  points: Point[]
}

interface User {
  id: string
  name: string
  email: string
  role: 'PARENT' | 'KID'
  children?: Child[]
  points?: Point[]
}

interface DashboardClientProps {
  user: User
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [points, setPoints] = useState<Point[]>(user.points || [])
  const [children, setChildren] = useState<Child[]>(user.children || [])
  const [isAddingPoints, setIsAddingPoints] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [newPointsAmount, setNewPointsAmount] = useState('')
  const [newPointsReason, setNewPointsReason] = useState('')

  const isParent = user.role === 'PARENT'
  const totalPoints = isParent 
    ? children.reduce((total, child) => 
        total + child.points.reduce((sum, point) => sum + point.amount, 0), 0)
    : points.reduce((sum, point) => sum + point.amount, 0)

  const weeklyPoints = isParent
    ? children.reduce((total, child) =>
        total + child.points
          .filter(point => new Date(point.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((sum, point) => sum + point.amount, 0), 0)
    : points
        .filter(point => new Date(point.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((sum, point) => sum + point.amount, 0)

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isParent) return
    if (!selectedChild || !newPointsAmount) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedChild,
          amount: parseInt(newPointsAmount),
          description: newPointsReason || null
        })
      })

      if (!response.ok) throw new Error('Failed to add points')

      const newPoint = await response.json()
      
      setChildren(prev => prev.map(child => 
        child.id === selectedChild 
          ? { ...child, points: [newPoint, ...child.points] }
          : child
      ))

      setNewPointsAmount('')
      setNewPointsReason('')
      setIsAddingPoints(false)
      toast.success(`${parseInt(newPointsAmount) > 0 ? 'Points awarded! 🎉' : 'Points deducted 📝'}`)
    } catch (error) {
      toast.error('Failed to add points')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    
    // Create a completely deterministic format to avoid hydration issues
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const month = months[date.getUTCMonth()]
    const day = date.getUTCDate()
    const hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()
    
    // Convert to 12-hour format
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedMinutes = minutes.toString().padStart(2, '0')
    
    return `${month} ${day}, ${hour12.toString().padStart(2, '0')}:${formattedMinutes} ${ampm}`
  }

  const getPointsIcon = (amount: number) => {
    if (amount < 0) {
      // Negative points - different colors for penalties
      if (amount <= -50) return <Trophy className="w-5 h-5 text-red-600" />
      if (amount <= -25) return <Award className="w-5 h-5 text-red-500" />
      if (amount <= -10) return <Target className="w-5 h-5 text-orange-500" />
      return <Star className="w-5 h-5 text-orange-400" />
    }
    
    // Positive points - original logic
    if (amount >= 100) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (amount >= 50) return <Award className="w-5 h-5 text-purple-500" />
    if (amount >= 25) return <Target className="w-5 h-5 text-blue-500" />
    return <Star className="w-5 h-5 text-green-500" />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background shadow-sm" style={{ zIndex: 9999 }}>
        <div className="container flex h-full items-center justify-between" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              {isParent ? <Users className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Kiddie Rewards App
            </h1>
          </motion.div>

          <div className="flex items-center gap-6">
            {isParent && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/children">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Kids
                </a>
              </Button>
            )}
            
            <ThemeToggle />
            
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '6rem', paddingBottom: '1.5rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {isParent ? 'Family Dashboard' : 'My Points'}
          </h2>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! {isParent ? 'Track your family\'s progress and award points.' : 'Here\'s your current points and recent activity.'}
          </p>
        </motion.div>
        {/* Stats Grid */}
        <section style={{ paddingBottom: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
          {/* Total Points */}
          <Card className="h-full relative" style={{ zIndex: 1 }}>
            <div className="flex flex-row items-center justify-between" style={{ padding: '1.5rem', paddingBottom: '0.5rem' }}>
              <h3 className="text-sm font-medium text-muted-foreground">
                {isParent ? 'Total Family Points' : 'My Points'}
              </h3>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
              <div className="text-2xl font-bold tracking-tight" suppressHydrationWarning>
                {totalPoints.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +{weeklyPoints} from last week
              </p>
            </div>
          </Card>

          {/* Weekly Progress */}
          <Card className="h-full relative" style={{ zIndex: 1 }}>
            <div className="flex flex-row items-center justify-between" style={{ padding: '1.5rem', paddingBottom: '0.5rem' }}>
              <h3 className="text-sm font-medium text-muted-foreground">This Week</h3>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
              <div className="text-2xl font-bold tracking-tight" suppressHydrationWarning>
                {weeklyPoints}
              </div>
              <div className="mt-3 w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((weeklyPoints / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Activity */}
          <Card className="h-full relative" style={{ zIndex: 1 }}>
            <div className="flex flex-row items-center justify-between" style={{ padding: '1.5rem', paddingBottom: '0.5rem' }}>
              <h3 className="text-sm font-medium text-muted-foreground">
                {isParent ? 'Active Kids' : 'Total Entries'}
              </h3>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </div>
            <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
              <div className="text-2xl font-bold tracking-tight" suppressHydrationWarning>
                {isParent 
                  ? children.filter(child => 
                      child.points.some(point => 
                        new Date(point.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      )
                    ).length
                  : points.length
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isParent ? 'this week' : 'all time'}
              </p>
            </div>
          </Card>

          {/* Children Count (parent only) */}
          {isParent && (
            <Card className="h-full relative" style={{ zIndex: 1 }}>
              <div className="flex flex-row items-center justify-between" style={{ padding: '1.5rem', paddingBottom: '0.5rem' }}>
                <h3 className="text-sm font-medium text-muted-foreground">Total Children</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
                <div className="text-2xl font-bold tracking-tight">{children.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  registered accounts
                </p>
              </div>
            </Card>
          )}
          </motion.div>
        </section>

        {/* Quick Actions for Parents */}
        {isParent && (
          <section style={{ paddingBottom: '4rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
            <Card>
              <CardHeader style={{ padding: '1.5rem' }}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                  <Button
                    onClick={() => setIsAddingPoints(!isAddingPoints)}
                    variant={isAddingPoints ? "outline" : "default"}
                    size="sm"
                  >
                    {isAddingPoints ? 'Cancel' : 'Award Points'}
                  </Button>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {isAddingPoints && (
                  <CardContent style={{ padding: '1.5rem', paddingTop: '0' }}>
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleAddPoints}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4"
                    >
                      <select
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">Choose a child</option>
                        {children.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.name}
                          </option>
                        ))}
                      </select>
                      
                      <Input
                        type="number"
                        value={newPointsAmount}
                        onChange={(e) => setNewPointsAmount(e.target.value)}
                        placeholder="Points (e.g., 10 or -5)"
                        required
                      />
                      
                      <Input
                        type="text"
                        value={newPointsReason}
                        onChange={(e) => setNewPointsReason(e.target.value)}
                        placeholder="Reason (optional)"
                      />
                      
                      <Button type="submit" className="w-full">
                        Add Points
                      </Button>
                    </motion.form>
                  </CardContent>
                )}
              </AnimatePresence>
            </Card>
            </motion.div>
          </section>
        )}

        {/* Recent Activity */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
          <Card>
            <CardHeader style={{ padding: '1.5rem' }}>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>{isParent ? 'Family Activity' : 'Recent Activity'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem', paddingTop: '0' }} className="space-y-6">
              {isParent ? (
                children.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No children yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Add your first child to start tracking their points and progress.
                    </p>
                    <Button asChild>
                      <a href="/children">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Child
                      </a>
                    </Button>
                  </div>
                ) : (
                  children.map((child) => (
                    <div key={child.id} style={{ paddingBottom: '1.5rem' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {child.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{child.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {child.points.reduce((sum, point) => sum + point.amount, 0)} total points
                          </p>
                        </div>
                      </div>
                      
                      <div className="pl-11" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {child.points.slice(0, 3).map((point) => (
                          <div key={point.id} className="flex items-center justify-between bg-muted rounded-lg" style={{ padding: '0.75rem' }}>
                            <div className="flex items-center space-x-3">
                              {getPointsIcon(point.amount)}
                              <div>
                                <p className={`font-medium text-sm ${point.amount >= 0 
                                  ? 'text-green-600' 
                                  : 'text-destructive'
                                }`}>
                                  {point.amount >= 0 ? '+' : ''}{point.amount} points
                                </p>
                                {point.description && (
                                  <p className="text-xs text-muted-foreground">{point.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDate(point.createdAt)}</span>
                          </div>
                        ))}
                        {child.points.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2">No activity yet</p>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                points.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No points yet!</h3>
                    <p className="text-muted-foreground text-center">
                      Ask your parent to award you some points for being awesome! 🌟
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {points.slice(0, 10).map((point, index) => (
                      <motion.div
                        key={point.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between bg-muted rounded-lg" style={{ padding: '0.75rem' }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                            {getPointsIcon(point.amount)}
                          </div>
                          <div>
                            <p className={`font-medium text-sm ${point.amount >= 0 
                              ? 'text-green-600' 
                              : 'text-destructive'
                            }`}>
                              {point.amount >= 0 ? '+' : ''}{point.amount} points
                            </p>
                            {point.description && (
                              <p className="text-xs text-muted-foreground">{point.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(point.createdAt)}</span>
                      </motion.div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
          </motion.div>
        </section>
      </main>
    </div>
  )
}