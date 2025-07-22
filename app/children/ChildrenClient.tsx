'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, UserPlus, Star, Calendar, ArrowLeft, Eye, EyeOff, Copy, LogIn, Home, ChevronRight, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/app/components/theme-toggle'

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
  role: 'PARENT'
  children: Child[]
}

interface ChildrenClientProps {
  user: User
}

export default function ChildrenClient({ user }: ChildrenClientProps) {
  const [children, setChildren] = useState<Child[]>(user.children)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [childName, setChildName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const router = useRouter()

  const generatePassword = () => {
    // Only generate password on client-side to prevent hydration issues
    if (typeof window === 'undefined') return
    
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(password)
    setShowPassword(true)
  }

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!generatedPassword) {
      toast.error('Please generate a password first')
      return
    }
    
    setIsLoading(true)

    // Generate a unique username for the child (client-side only)
    const childUsername = childName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 10000).toString()

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: childName,
          password: generatedPassword,
          role: 'KID',
          parentId: user.id,
          childUsername: childUsername
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add child')
      }

      // Add the new child to the list
      setChildren(prev => [...prev, { ...result, points: [] }])
      
      // Show success message with login info
      toast.success(
        <div>
          <p className="font-semibold">{childName} added successfully!</p>
          <p className="text-sm mt-1">Child Login Username: {childUsername}</p>
          <p className="text-sm">Password: {generatedPassword}</p>
        </div>,
        { duration: 10000 }
      )
      
      setChildName('')
      setGeneratedPassword('')
      setShowPassword(false)
      setIsAddingChild(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add child')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    
    // Create a completely deterministic format to avoid hydration issues
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const month = months[date.getUTCMonth()]
    const day = date.getUTCDate()
    const year = date.getUTCFullYear()
    
    return `${month} ${day}, ${year}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background shadow-sm" style={{ zIndex: 9999, backgroundColor: 'hsl(var(--background))' }}>
        <div className="container flex h-full items-center justify-between" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Kiddie Rewards App</h1>
          </Link>

          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Home
              </a>
            </Button>
            
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
            Manage Children
          </h2>
          <p className="text-muted-foreground">
            Add and manage your children's accounts. Create secure login credentials for each child.
          </p>
        </motion.div>
        {/* Stats Grid */}
        <section style={{ paddingBottom: '4rem' }}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
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

          <Card>
            <div className="flex flex-row items-center justify-between" style={{ padding: '1.5rem', paddingBottom: '0.5rem' }}>
              <h3 className="text-sm font-medium text-muted-foreground">Total Points Given</h3>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
              <div className="text-2xl font-bold tracking-tight">
                {children.reduce((sum, child) => sum + child.points.reduce((total, point) => total + point.amount, 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                across all children
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex flex-row items-center justify-between" style={{ padding: '1.5rem', paddingBottom: '0.5rem' }}>
              <h3 className="text-sm font-medium text-muted-foreground">Active This Week</h3>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
              <div className="text-2xl font-bold tracking-tight" suppressHydrationWarning>
                {children.filter(child => 
                  child.points.some(point => 
                    new Date(point.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  )
                ).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                out of {children.length} children
              </p>
            </div>
          </Card>
          </div>
        </section>

        {/* Add Child Section */}
        <section style={{ paddingBottom: '4rem' }}>
          <Card>
          <CardHeader style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Add New Child</span>
              </CardTitle>
              <Button
                onClick={() => setIsAddingChild(!isAddingChild)}
                variant={isAddingChild ? 'outline' : 'default'}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isAddingChild ? 'Cancel' : 'Add Child'}
              </Button>
            </div>
          </CardHeader>

          <AnimatePresence>
            {isAddingChild && (
              <CardContent style={{ padding: '1.5rem', paddingTop: '0' }}>
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleAddChild}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="childName">Child's Name</Label>
                      <Input
                        id="childName"
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Enter child's name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={generatedPassword}
                            readOnly
                            placeholder="Generate password"
                            className="bg-muted"
                          />
                          {generatedPassword && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={generatePassword}
                          variant="outline"
                        >
                          Generate
                        </Button>
                      </div>
                      {generatedPassword && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (typeof window !== 'undefined' && navigator.clipboard) {
                              navigator.clipboard.writeText(generatedPassword)
                              toast.success('Password copied!')
                            }
                          }}
                          className="h-auto p-1 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy password
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Login Information
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                          <p>Username: Auto-generated (e.g., john1234)</p>
                          <p>Password: Use the generated password above</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add Child Account'}
                  </Button>
                </motion.form>
              </CardContent>
            )}
          </AnimatePresence>
          </Card>
        </section>

        {/* Children Grid */}
        <section>
        {children.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center" style={{ padding: '3rem' }}>
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No children yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first child to start tracking their points and progress.
              </p>
              <Button onClick={() => setIsAddingChild(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Child
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child, index) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="text-center" style={{ padding: '1.5rem' }}>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-lg">
                        {child.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <CardTitle className="text-base">{child.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{child.email}</p>
                  </CardHeader>
                  <CardContent className="space-y-4" style={{ padding: '1.5rem', paddingTop: '0' }}>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {child.points.reduce((sum, point) => sum + point.amount, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Points</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-muted-foreground">
                          {child.points.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Entries</p>
                      </div>
                    </div>

                    {child.points.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Activity</h4>
                        {child.points.slice(0, 3).map((point) => (
                          <div key={point.id} className="flex items-center justify-between text-sm bg-muted rounded" style={{ padding: '0.75rem' }}>
                            <span className={`font-medium ${point.amount >= 0 
                              ? 'text-green-600' 
                              : 'text-destructive'
                            }`}>
                              {point.amount >= 0 ? '+' : ''}{point.amount}
                              {point.description && (
                                <span className="text-muted-foreground font-normal"> • {point.description}</span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(point.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        </section>
      </main>
    </div>
  )
}