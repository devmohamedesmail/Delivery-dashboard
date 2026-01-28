'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import ProfileController, { UserProfile } from '@/controllers/delivery-app/profile-controller'
import toast from 'react-hot-toast'
import { Pencil, Camera, Loader2, User2, Mail, Phone, Shield } from 'lucide-react'

export default function Profile() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fix hydration by ensuring component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await ProfileController.getProfile()
      setProfile(data)
      if (data.avatar) {
        setAvatarPreview(data.avatar)
      }
    } catch (error: any) {
      toast.error(t('profile.errorLoadingProfile'))
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('profile.validation.nameRequired'))
      .min(2, t('profile.validation.nameMin')),
    email: Yup.string()
      .required(t('profile.validation.emailRequired'))
      .email(t('profile.validation.emailInvalid')),
    phone: Yup.string()
      .required(t('profile.validation.phoneRequired'))
  })

  const formik = useFormik({
    initialValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      avatar: null as File | null
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const updateData: any = {
          name: values.name,
          email: values.email,
          phone: values.phone,
        }

        if (values.avatar instanceof File) {
          updateData.avatar = values.avatar
        }

        const updatedProfile = await ProfileController.updateProfile(updateData)
        setProfile(updatedProfile)
        setEditMode(false)
        toast.success(t('profile.updateSuccess'))

        // Update avatar preview if new avatar was uploaded
        if (updatedProfile.avatar) {
          setAvatarPreview(updatedProfile.avatar)
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || t('profile.updateError'))
        console.error('Error updating profile:', error)
      } finally {
        setSubmitting(false)
      }
    }
  })

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      formik.setFieldValue('avatar', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    formik.resetForm()
    setAvatarPreview(profile?.avatar || null)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-muted-foreground">{t('profile.errorLoadingProfile')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="grid gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('profile.personalInfo')}</CardTitle>
                  <CardDescription>{editMode ? t('profile.editMode') : t('profile.viewMode')}</CardDescription>
                </div>
                {!editMode && (
                  <Button
                    type="button"
                    onClick={() => setEditMode(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    {t('profile.edit')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User2 className="w-16 h-16 text-primary" />
                      )}
                    </div>
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl font-bold">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.role.role}</p>
                    {editMode && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('profile.changeAvatar')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User2 className="w-4 h-4 text-muted-foreground" />
                        {t('profile.name')}
                      </Label>
                      {editMode ? (
                        <div>
                          <Input
                            id="name"
                            name="name"
                            placeholder={t('profile.namePlaceholder')}
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          {formik.touched.name && formik.errors.name && (
                            <p className="text-sm text-destructive mt-1">
                              {formik.errors.name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-base font-medium">{profile.name}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {t('profile.email')}
                      </Label>
                      {editMode ? (
                        <div>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t('profile.emailPlaceholder')}
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          {formik.touched.email && formik.errors.email && (
                            <p className="text-sm text-destructive mt-1">
                              {formik.errors.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-base font-medium">{profile.email}</p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {t('profile.phone')}
                      </Label>
                      {editMode ? (
                        <div>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder={t('profile.phonePlaceholder')}
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          {formik.touched.phone && formik.errors.phone && (
                            <p className="text-sm text-destructive mt-1">
                              {formik.errors.phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-base font-medium">{profile.phone}</p>
                      )}
                    </div>

                    {/* Role Field (Read-only) */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        {t('profile.role')}
                      </Label>
                      <p className="text-base font-medium">{profile.role.role}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {editMode && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="flex-1"
                    >
                      {formik.isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('profile.saving')}
                        </>
                      ) : (
                        t('profile.save')
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={formik.isSubmitting}
                      className="flex-1"
                    >
                      {t('profile.cancel')}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Store Information (if applicable) */}
          {profile.store && (
            <Card>
              <CardHeader>
                <CardTitle>{t('stores.store')}</CardTitle>
                <CardDescription>{t('stores.viewStore')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('stores.storeName')}</p>
                  <p className="text-base font-medium">{profile.store.name}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  )
}
