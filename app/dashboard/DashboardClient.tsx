'use client'

import { useState, useMemo, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/app/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Star, 
  Plus, 
  Trophy, 
  LogOut,
  Users,
  Gift,
  Calendar,
  Zap,
  Award,
  Target,
  Sparkles,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import ChildActivityCard from './components/ChildActivityCard'

// Constants moved outside component for performance
const CHILD_COLORS = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600', 
  'from-green-400 to-green-600',
  'from-pink-400 to-pink-600',
  'from-orange-400 to-orange-600',
  'from-indigo-400 to-indigo-600'
] as const

interface Point {
  id: string
  amount: number
  description: string | null
  createdAt: string | Date
}

interface Child {
  id: string
  name: string | null
  email: string | null
  points: Point[]
}

interface User {
  id: string
  name: string | null
  email: string | null
  role: 'PARENT' | 'KID'
  children?: Child[]
  points?: Point[]
}

interface DashboardClientProps {
  user: User
}

interface ActivityRequest {
  id: string
  activity: string
  description: string
  activityDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  requestedBy?: Child
  reviewedAt?: string
  point?: Point
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [points] = useState<Point[]>(user.points || [])
  const [children, setChildren] = useState<Child[]>(user.children || [])
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [newPointsAmount, setNewPointsAmount] = useState('')
  const [newPointsReason, setNewPointsReason] = useState('')
  
  // For kids - activity submission
  const [selectedActivity, setSelectedActivity] = useState('')
  const [activityDescription, setActivityDescription] = useState('')
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // For parents - pending requests
  const [pendingRequests, setPendingRequests] = useState<ActivityRequest[]>([])
  const [myRequests, setMyRequests] = useState<ActivityRequest[]>([])
  
  
  // For parents - view as child
  const [viewAsChildId, setViewAsChildId] = useState<string | null>(null)

  const isParent = user.role === 'PARENT' && !viewAsChildId
  const viewingChild = useMemo(() => 
    viewAsChildId ? children.find(c => c.id === viewAsChildId) : null, 
    [viewAsChildId, children]
  )
  const effectivePoints = useMemo(() => 
    viewingChild ? viewingChild.points : (user.role === 'KID' ? points : []), 
    [viewingChild, user.role, points]
  )
  
  const totalPoints = useMemo(() => {
    return isParent 
      ? children.reduce((total, child) => 
          total + child.points.reduce((sum, point) => sum + point.amount, 0), 0)
      : effectivePoints.reduce((sum, point) => sum + point.amount, 0)
  }, [isParent, children, effectivePoints])

  // Fetch activity requests
  useEffect(() => {
    fetchActivityRequests()
  }, [viewAsChildId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchActivityRequests = async () => {
    try {
      const response = await fetch('/api/activity-requests')
      if (response.ok) {
        const data = await response.json()
        if (isParent) {
          setPendingRequests(data)
        } else {
          setMyRequests(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch activity requests:', error)
    }
  }


  const weeklyPoints = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return isParent
      ? children.reduce((total, child) =>
          total + child.points
            .filter(point => new Date(point.createdAt).getTime() > weekAgo)
            .reduce((sum, point) => sum + point.amount, 0), 0)
      : effectivePoints
          .filter(point => new Date(point.createdAt).getTime() > weekAgo)
          .reduce((sum, point) => sum + point.amount, 0)
  }, [isParent, children, effectivePoints])

  const handleAddPoints = useCallback(async (e: React.FormEvent) => {
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
      toast.success(`${parseInt(newPointsAmount) > 0 ? 'Points awarded! 🎉' : 'Points deducted 📝'}`)
    } catch {
      toast.error('Failed to add points')
    }
  }, [isParent, selectedChild, newPointsAmount, newPointsReason, setChildren])

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedActivity || !activityDescription || !activityDate) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/activity-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: selectedActivity,
          description: activityDescription,
          activityDate,
          ...(viewAsChildId && { childId: viewAsChildId })
        })
      })

      if (!response.ok) throw new Error('Failed to submit activity')

      const newRequest = await response.json()
      setMyRequests(prev => [newRequest, ...prev])
      
      // Reset form
      setSelectedActivity('')
      setActivityDescription('')
      setActivityDate(new Date().toISOString().split('T')[0])
      
      // Show context-aware success message
      const successMessage = viewAsChildId 
        ? `Activity submitted for ${viewingChild?.name}!`
        : 'Activity submitted to your parent for approval!'
      
      console.log('Showing toast:', successMessage)
      toast.success(successMessage, {
        duration: 5000,
        position: 'bottom-center',
        style: {
          background: '#10B981',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 99999
        }
      })
    } catch {
      toast.error('Failed to submit activity')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReviewRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED', points?: number) => {
    try {
      const response = await fetch(`/api/activity-requests/${requestId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, points })
      })

      if (!response.ok) throw new Error('Failed to review request')

      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== requestId))
      
      // Refresh children data if approved
      if (status === 'APPROVED') {
        // Refetch data
        window.location.reload()
      }
      
      toast.success(status === 'APPROVED' ? 'Request approved!' : 'Request rejected')
    } catch {
      toast.error('Failed to review request')
    }
  }

  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput)
    
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

  // eslint-disable-next-line react/display-name
  const getPointsIcon = useMemo(() => (amount: number) => {
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
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background shadow-sm" style={{ zIndex: 9999, backgroundColor: 'hsl(var(--background))' }}>
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
            
            {user.role === 'PARENT' && children.length > 0 && (
              <select
                value={viewAsChildId || ''}
                onChange={(e) => setViewAsChildId(e.target.value || null)}
                className="flex h-9 px-3 py-1 text-sm rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Parent View</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    View as {child.name || 'Child'}
                  </option>
                ))}
              </select>
            )}
            
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
            {viewAsChildId ? `${viewingChild?.name}&apos;s Dashboard` : (isParent ? 'Family Dashboard' : 'My Points')}
          </h2>
          <p className="text-muted-foreground">
            {viewAsChildId ? (
              <span className="text-orange-600 font-medium">Viewing as {viewingChild?.name} - You&apos;re seeing what your child sees</span>
            ) : (
              <>Welcome back, {user.name || 'User'}! {isParent ? 'Track your family&apos;s progress and award points.' : 'Here&apos;s your current points and recent activity.'}</>
            )}
          </p>
        </motion.div>
        {/* Pending Requests for Parents - TOP PRIORITY */}
        {isParent && pendingRequests.length > 0 && (
          <section style={{ paddingBottom: '4rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader style={{ padding: '1.5rem' }}>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <span>Pending Activity Requests</span>
                    <span className="text-sm font-normal text-muted-foreground">({pendingRequests.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '1.5rem', paddingTop: '0' }} className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{request.requestedBy?.name}</span>
                            <span className="text-sm text-muted-foreground">
                              • {formatDate(request.activityDate)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{request.activity}</span>
                            <p className="text-muted-foreground mt-1">{request.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Label className="text-sm">Points:</Label>
                          <Input
                            type="number"
                            placeholder="10"
                            className="w-20"
                            id={`points-${request.id}`}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            const pointsInput = document.getElementById(`points-${request.id}`) as HTMLInputElement
                            const points = parseInt(pointsInput?.value || '0')
                            if (points > 0) {
                              handleReviewRequest(request.id, 'APPROVED', points)
                            } else {
                              toast.error('Please enter points amount')
                            }
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewRequest(request.id, 'REJECTED')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </section>
        )}

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
                {viewAsChildId ? `${viewingChild?.name}&apos;s Points` : (isParent ? 'Total Family Points' : 'My Points')}
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
                {viewAsChildId || !isParent ? 'Total Entries' : 'Active Kids'}
              </h3>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </div>
            <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
              <div className="text-2xl font-bold tracking-tight" suppressHydrationWarning>
                {viewAsChildId || !isParent
                  ? effectivePoints.length
                  : children.filter(child => 
                      child.points.some(point => 
                        new Date(point.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      )
                    ).length
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {viewAsChildId || !isParent ? 'all time' : 'this week'}
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
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Award Points</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent style={{ padding: '1.5rem', paddingTop: '0' }}>
                {children.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No children yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first child to start awarding points.
                    </p>
                    <Button asChild>
                      <a href="/children">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Child
                      </a>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleAddPoints} className="space-y-4">
                    {/* Child Selection - Always at top */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Select Child</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {children.map((child, index) => {
                          const colorClass = CHILD_COLORS[index % CHILD_COLORS.length]
                          
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => setSelectedChild(child.id)}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                selectedChild === child.id 
                                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                                  : 'border-border hover:border-muted-foreground hover:bg-muted/30'
                              }`}
                            >
                              <div className="flex flex-col items-center space-y-1">
                                <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                                  {(child.name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-xs">{child.name || 'Child'}</span>
                                <span className="text-xs text-muted-foreground">
                                  {child.points.reduce((sum, point) => sum + point.amount, 0)} pts
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Quick Reason Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Reason <span className="text-destructive">*</span></Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { label: '🏠 Chores', value: 'Completed chores' },
                          { label: '📚 Homework', value: 'Finished homework' },
                          { label: '🎯 Good Behavior', value: 'Good behavior' },
                          { label: '🎉 Achievement', value: 'Special achievement' },
                          { label: '🤝 Helping Others', value: 'Helped family member' },
                          { label: '⭐ Extra Effort', value: 'Went above and beyond' },
                          { label: '📖 Reading', value: 'Reading time' },
                          { label: '❌ Penalty', value: 'Rule violation' }
                        ].map((reason) => (
                          <button
                            key={reason.value}
                            type="button"
                            onClick={() => {
                              setNewPointsReason(reason.value)
                              // Auto-set points based on reason type
                              if (reason.value === 'Rule violation') {
                                setNewPointsAmount('-5')
                              } else if (!newPointsAmount) {
                                setNewPointsAmount('10')
                              }
                            }}
                            className={`p-2 text-xs rounded-lg border transition-all duration-200 ${
                              newPointsReason === reason.value
                                ? 'border-orange-500 bg-orange-100 text-orange-700 ring-2 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-400 dark:ring-orange-800'
                                : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                            }`}
                          >
                            {reason.label}
                          </button>
                        ))}
                      </div>
                      
                      {/* Custom Reason Input */}
                      <Input
                        type="text"
                        value={newPointsReason}
                        onChange={(e) => setNewPointsReason(e.target.value)}
                        placeholder="Or enter custom reason..."
                        required
                      />
                    </div>

                    {/* Points Amount */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Points Amount</Label>
                      <div className="flex gap-2 flex-wrap">
                        {['+5', '+10', '+20', '-5'].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setNewPointsAmount(amount.replace('+', ''))}
                            className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                              newPointsAmount === amount.replace('+', '')
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                            }`}
                          >
                            {amount}
                          </button>
                        ))}
                        <Input
                          type="number"
                          value={newPointsAmount}
                          onChange={(e) => setNewPointsAmount(e.target.value)}
                          placeholder="Custom"
                          className="w-20"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={!selectedChild || !newPointsReason || !newPointsAmount}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Award {newPointsAmount ? `${newPointsAmount} ` : ''}Points
                      {selectedChild && children.find(c => c.id === selectedChild) && ` to ${children.find(c => c.id === selectedChild)?.name}`}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
            </motion.div>
          </section>
        )}

        {/* Activity Submission for Kids */}
        {!isParent && (
          <section style={{ paddingBottom: '4rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader style={{ padding: '1.5rem' }}>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Submit Activity for Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '1.5rem', paddingTop: '0' }}>
                  <form onSubmit={handleSubmitActivity} className="space-y-4">
                    {/* Activity Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Activity Type <span className="text-destructive">*</span></Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { label: '🏠 Chores', value: 'Completed chores' },
                          { label: '📚 Homework', value: 'Finished homework' },
                          { label: '🎯 Good Behavior', value: 'Good behavior' },
                          { label: '🎉 Achievement', value: 'Special achievement' },
                          { label: '🤝 Helping Others', value: 'Helped family member' },
                          { label: '⭐ Extra Effort', value: 'Went above and beyond' },
                          { label: '📖 Reading', value: 'Reading time' }
                        ].map((activity) => (
                          <button
                            key={activity.value}
                            type="button"
                            onClick={() => setSelectedActivity(activity.value)}
                            className={`p-2 text-xs rounded-lg border transition-all duration-200 ${
                              selectedActivity === activity.value
                                ? 'border-orange-500 bg-orange-100 text-orange-700 ring-2 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-400 dark:ring-orange-800'
                                : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                            }`}
                          >
                            {activity.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        What did you do? <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={activityDescription}
                        onChange={(e) => setActivityDescription(e.target.value)}
                        placeholder="Describe what you did..."
                        required
                      />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">When did you do this?</Label>
                      <Input
                        type="date"
                        value={activityDate}
                        onChange={(e) => setActivityDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={!selectedActivity || !activityDescription || isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Activity
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        )}



        {/* My Activity Requests for Kids */}
        {!isParent && myRequests.length > 0 && (
          <section style={{ paddingBottom: '4rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader style={{ padding: '1.5rem' }}>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>My Activity Requests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '1.5rem', paddingTop: '0' }} className="space-y-3">
                  {myRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between bg-muted rounded-lg" style={{ padding: '0.75rem' }}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          request.status === 'APPROVED' ? 'bg-green-500' :
                          request.status === 'REJECTED' ? 'bg-red-500' :
                          'bg-orange-500'
                        }`}>
                          {request.status === 'APPROVED' ? <CheckCircle className="w-4 h-4 text-white" /> :
                           request.status === 'REJECTED' ? <XCircle className="w-4 h-4 text-white" /> :
                           <AlertCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{request.activity}</p>
                          <p className="text-xs text-muted-foreground">{request.description}</p>
                          {request.status === 'APPROVED' && request.point && (
                            <p className="text-xs text-green-600 font-medium mt-1">+{request.point.amount} points</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatDate(request.activityDate)}</p>
                        <p className={`text-xs font-medium ${
                          request.status === 'APPROVED' ? 'text-green-600' :
                          request.status === 'REJECTED' ? 'text-red-600' :
                          'text-orange-600'
                        }`}>
                          {request.status === 'APPROVED' ? 'Approved' :
                           request.status === 'REJECTED' ? 'Rejected' :
                           'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
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
              {isParent && !viewAsChildId ? (
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
                  children.map((child, index) => (
                    <ChildActivityCard 
                      key={child.id}
                      child={child}
                      formatDate={formatDate}
                    />
                  ))
                )
              ) : (
                effectivePoints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No points yet!</h3>
                    <p className="text-muted-foreground text-center">
                      Ask your parent to award you some points for being awesome! 🌟
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {effectivePoints.slice(0, 10).map((point, index) => (
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