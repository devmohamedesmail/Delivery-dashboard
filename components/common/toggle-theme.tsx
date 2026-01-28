import React from 'react'
import {Moon} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ToggleTheme() {
    const {t}=useTranslation();
  return (
    <button
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={t('header.theme')}
        >
          <Moon className="w-6 h-6" />
        </button>
  )
}
