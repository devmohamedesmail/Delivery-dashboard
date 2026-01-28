import React from 'react'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      {children}
    </div>
  )
}
