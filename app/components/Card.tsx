import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
}

export default function Card({ children, className, animate = true }: CardProps) {
  const Component = animate ? motion.div : 'div'
  
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {}

  return (
    <Component
      className={cn(
        'bg-card rounded-xl shadow-sm border border-border p-6',
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  )
}