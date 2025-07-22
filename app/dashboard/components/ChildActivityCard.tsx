import React from 'react'
import { motion } from 'framer-motion'
import { Star, Award, Target, Trophy } from 'lucide-react'

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

interface ChildActivityCardProps {
  child: Child
  formatDate: (date: string | Date) => string
}

const ChildActivityCard = React.memo(({ child, formatDate }: ChildActivityCardProps) => {
  const totalPoints = React.useMemo(() => 
    child.points.reduce((sum, point) => sum + point.amount, 0), 
    [child.points]
  )
  
  const recentPoints = React.useMemo(() => 
    child.points.slice(0, 3), 
    [child.points]
  )

  const getPointsIcon = React.useCallback((amount: number) => {
    if (amount < 0) {
      if (amount <= -50) return <Trophy className="w-5 h-5 text-red-600" />
      if (amount <= -25) return <Award className="w-5 h-5 text-red-500" />
      if (amount <= -10) return <Target className="w-5 h-5 text-orange-500" />
      return <Star className="w-5 h-5 text-orange-400" />
    }
    
    if (amount >= 100) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (amount >= 50) return <Award className="w-5 h-5 text-purple-500" />
    if (amount >= 25) return <Target className="w-5 h-5 text-blue-500" />
    return <Star className="w-5 h-5 text-green-500" />
  }, [])

  return (
    <div style={{ paddingBottom: '1.5rem' }}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {(child.name || 'C').charAt(0)}
        </div>
        <div>
          <h4 className="font-medium">{child.name || 'Child'}</h4>
          <p className="text-sm text-muted-foreground">
            {totalPoints} total points
          </p>
        </div>
      </div>
      
      <div className="pl-11" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recentPoints.map((point) => (
          <motion.div 
            key={point.id} 
            className="flex items-center justify-between bg-muted rounded-lg" 
            style={{ padding: '0.75rem' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        ))}
        {recentPoints.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">No activity yet</p>
        )}
      </div>
    </div>
  )
})

ChildActivityCard.displayName = 'ChildActivityCard'

export default ChildActivityCard