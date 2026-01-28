'use client'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../common/language-switcher'
import { Bell, Mail } from 'lucide-react'
import ToggleTheme from '../common/toggle-theme'
import UserMenu from '../common/user-menu'
import { Button } from '../ui/button'
import { useAuth } from '@/context/auth-provider'
export default function Header() {
  const { t } = useTranslation()



  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
      <div></div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 ml-6">
        {/* Language Switcher */}
        <LanguageSwitcher />


        {/* Notifications */}
        <Button
          className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={t('header.notifications')}
        >

          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* Messages */}
        <button
          className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={t('header.messages')}
        >
          <Mail className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <ToggleTheme />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}
