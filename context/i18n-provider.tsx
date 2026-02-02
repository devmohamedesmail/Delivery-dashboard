'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n/config'

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Wait for i18n to be fully initialized
    const initLanguage = async () => {
      if (i18n.isInitialized) {
        const currentLanguage = i18n.language
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = currentLanguage
        setIsInitialized(true)
      }
    }

    initLanguage()
  }, [i18n])

  // Update direction when language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = lng
    }

    i18n.on('languageChanged', handleLanguageChange)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  return <>{children}</>
}
