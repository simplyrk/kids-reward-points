import React from 'react'
import { Card } from '@/components/ui/card'

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background shadow-sm" style={{ zIndex: 9999 }}>
        <div className="container flex h-full items-center justify-between" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-6">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <main className="container" style={{ paddingTop: '6rem', paddingBottom: '1.5rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <section style={{ paddingBottom: '4rem' }}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="h-32">
                <div className="p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions Skeleton */}
        <section style={{ paddingBottom: '4rem' }}>
          <Card>
            <div className="p-6 animate-pulse">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                ))}
              </div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </Card>
        </section>

        {/* Recent Activity Skeleton */}
        <section>
          <Card>
            <div className="p-6 animate-pulse">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      <div>
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default DashboardSkeleton