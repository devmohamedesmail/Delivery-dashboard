'use client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast';
import { useCookies } from 'react-cookie';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(false)
  const { t } = useTranslation();
  const { login } = useAuth()
  const router = useRouter()
  const [cookies] = useCookies(['access_token']);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
 
  const validationSchema = Yup.object({
    email: loginMethod === 'email'
      ? Yup.string().email(t('auth.email_invalid')).required(t('auth.email_required'))
      : Yup.string().notRequired(),
    phone: loginMethod === 'phone'
      ? Yup.string().matches(/^[0-9]{10,15}$/, t('auth.phone_invalid')).required(t('auth.phone_required'))
      : Yup.string().notRequired(),
    password: Yup.string()
      .required(t('auth.password_required'))
      .min(6, t('auth.password_min')),
  })

  const formik = useFormik({
    initialValues: {
      email: '',
      phone: '',
      password: '',
    },

    validationSchema,
    onSubmit: async (values) => {
      try {
       
        const identifier = loginMethod === 'email' ? values.email : values.phone
        const result = await login(identifier, values.password)
        const role = result?.user?.role?.role
        if (result.success && role === "admin") {
          toast.success(t("auth.login_success"))
          router.push('/delivery-app')
        } else {
          toast.error(t("auth.login_failed"))
        }
      } catch (error) {
        toast.error(t("auth.login_failed"))
      }
    },
  })
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Section */}

        <div className="bg-linear-to-br from-[#fd4a12] to-[#e03d0a] px-8 py-12 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

          <div className="relative z-10">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-5xl shadow-lg">
                🚕
              </div>
            </div>

            <h1 className="text-3xl text-white font-bold mb-2">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-white/90 text-base">
              {t('auth.loginToYourAccount')}
            </p>
          </div>
        </div>

        <Tabs defaultValue="account" className="w-[400px] px-8 py-10">
          <TabsList>
            <TabsTrigger value="account" onClick={() => setLoginMethod('email')}>{t('auth.login_by_email')}</TabsTrigger>
            <TabsTrigger value="password" onClick={() => setLoginMethod('phone')}>{t('auth.login_by_phone')}</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <form onSubmit={formik.handleSubmit} className="space-y-5">
              {/* Email/Phone Input */}
              <div>
                <Label>{t('auth.email')}</Label>
                <Input
                  placeholder={t('auth.email')}
                  value={formik.values.email}
                  onChange={formik.handleChange('email')}
                  type="text"

                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-red-500 text-sm">{formik.errors.email}</p>
                ) : null}
              </div>

              {/* Password Input */}
              <div>
                <Label>{t('auth.password')}</Label>
                <Input
                  placeholder={t('auth.enterPassword')}
                  value={formik.values.password}
                  onChange={formik.handleChange('password')}
                  type="password"

                />
                {formik.touched.password && formik.errors.password ? (
                  <p className="text-red-500 text-sm">{formik.errors.password}</p>
                ) : null}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 group"
                >
                  <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all ${rememberMe
                    ? 'bg-[#fd4a12] border-[#fd4a12]'
                    : 'border-gray-300 group-hover:border-[#fd4a12]'
                    }`}>
                    {rememberMe && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{t('auth.rememberMe')}</span>
                </button>

                <Link
                  href="/auth/forgot-password"
                  className="text-[#fd4a12] font-semibold text-sm hover:text-[#e03d0a] transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              {/* Login Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                  className="w-full bg-linear-to-r from-[#fd4a12] to-[#e03d0a] hover:from-[#e03d0a] hover:to-[#c93308] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
                >
                  {formik.isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      {t('auth.signingIn')}
                    </span>
                  ) : (
                    t('auth.signIn')
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">{t("auth.or")}</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-600">{t('auth.dontHaveAccount')} </span>
                <Link
                  href="/auth/register"
                  className="text-[#fd4a12] font-bold hover:text-[#e03d0a] transition-colors"
                >
                  {t('auth.signUp')}
                </Link>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="password">
            <form onSubmit={formik.handleSubmit} className="space-y-5">
              {/* Email/Phone Input */}
              <div>
                <Label>{t('auth.phone')}</Label>
                <Input
                  placeholder={t('auth.phone')}
                  value={formik.values.phone}
                  onChange={formik.handleChange('phone')}
                  type="text"

                />
                {formik.touched.phone && formik.errors.phone ? (
                  <p className="text-red-500 text-sm">{formik.errors.phone}</p>
                ) : null}
              </div>

              {/* Password Input */}
              <div>
                <Label>{t('auth.password')}</Label>
                <Input
                  placeholder={t('auth.enterPassword')}
                  value={formik.values.password}
                  onChange={formik.handleChange('password')}
                  type="password"

                />
                {formik.touched.password && formik.errors.password ? (
                  <p className="text-red-500 text-sm">{formik.errors.password}</p>
                ) : null}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 group"
                >
                  <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all ${rememberMe
                    ? 'bg-[#fd4a12] border-[#fd4a12]'
                    : 'border-gray-300 group-hover:border-[#fd4a12]'
                    }`}>
                    {rememberMe && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{t('auth.rememberMe')}</span>
                </button>

                <Link
                  href="/auth/forgot-password"
                  className="text-[#fd4a12] font-semibold text-sm hover:text-[#e03d0a] transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              {/* Login Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                  className="w-full bg-linear-to-r from-[#fd4a12] to-[#e03d0a] hover:from-[#e03d0a] hover:to-[#c93308] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
                >
                  {formik.isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      {t('auth.signingIn')}
                    </span>
                  ) : (
                    t('auth.signIn')
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">{t("auth.or")}</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-600">{t('auth.dontHaveAccount')} </span>
                <Link
                  href="/auth/register"
                  className="text-[#fd4a12] font-bold hover:text-[#e03d0a] transition-colors"
                >
                  {t('auth.signUp')}
                </Link>
              </div>
            </form>
          </TabsContent>
        </Tabs>


      </div>


    </div>
  )
}