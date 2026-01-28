'use client'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiHome, FiUsers, FiMapPin, FiSettings, FiMenu, FiX, FiUser } from 'react-icons/fi'
import { FaTaxi } from 'react-icons/fa'
import { IconType } from 'react-icons'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()
  const { user } = useAuth();

  // Fix hydration by ensuring component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems: Array<{ title: string; icon: IconType; href: string }> = [
    {
      title: t('sidebar.dashboard'),
      icon: FiHome,
      href: '/admin',
    },
    {
      title: t('sidebar.places'),
      icon: FiMapPin,
      href: '/admin/places',
    },
    {
      title: t('sidebar.areas'),
      icon: FiMapPin,
      href: '/admin/areas',
    },
    {
      title: t('sidebar.store-types'),
      icon: FiMapPin,
      href: '/admin/store-types',
    },
    {
      title: t('sidebar.stores'),
      icon: FiMapPin,
      href: '/admin/stores',
    },
    {
      title: t('sidebar.users'),
      icon: FiMapPin,
      href: '/admin/users',
    },

  ]

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <aside className="w-64 bg-gray-900 text-white min-h-screen transition-all duration-300 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
              <FaTaxi className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Tawsila</span>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-64'
        } bg-gray-900 text-white min-h-screen transition-all duration-300 flex flex-col`}
    >
      {/* Logo Section */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
              <FaTaxi className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Tawsila</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : ''
            }`}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <FiMenu className="w-5 h-5" /> : <FiX className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group"
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
              {!isCollapsed && (
                <span className="text-gray-300 group-hover:text-white font-medium">
                  {item.title}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FiUser className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email || user?.phone}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
