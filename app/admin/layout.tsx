import Header from '@/components/ui/header'
import Sidebar from '@/components/ui/sidebar'
import React from 'react'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
     <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
