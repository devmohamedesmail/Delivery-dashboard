'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SettingsController from '@/controllers/settings-controller';
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Image as ImageIcon, Upload } from "lucide-react";
import toast from 'react-hot-toast';
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  /* ================= FETCH SETTINGS ================= */
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: SettingsController.getSetting,
  });

  /* ================= UPDATE MUTATION ================= */
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      SettingsController.updateSetting(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      formik.resetForm();
      setIsEditOpen(false);
      setLogoPreview(null);
      setBannerPreview(null);
      toast.success(t("settings.updateSuccess"));
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || t("settings.errorSaving"));
    },
  });

  /* ================= TOGGLE MAINTENANCE MUTATION ================= */
  const toggleMaintenanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { maintenance_mode: boolean; maintenance_message?: string } }) =>
      SettingsController.toggleMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success(t("settings.updateSuccess"));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t("settings.errorSaving"));
    },
  });

  /* ================= VALIDATION SCHEMA ================= */
  const validationSchema = Yup.object({
    name_en: Yup.string().required(t("settings.validation.appNameRequired")).min(2, t("settings.validation.appNameMin")),
    name_ar: Yup.string().required(t("settings.validation.appNameRequired")).min(2, t("settings.validation.appNameMin")),
    version: Yup.string().required("Version is required"),
    description: Yup.string().required("Description is required"),
    url: Yup.string().url(t("settings.validation.urlInvalid")).required("URL is required"),
    email: Yup.string().email(t("settings.validation.emailInvalid")).required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    address: Yup.string().required("Address is required"),
    maintenance_mode: Yup.boolean(),
    maintenance_message: Yup.string().when('maintenance_mode', {
      is: true,
      then: (schema) => schema.required(t("settings.validation.maintenanceMessageRequired")),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  /* ================= FORMIK ================= */
  const formik = useFormik({
    initialValues: {
      name_en: settings?.name_en || "",
      name_ar: settings?.name_ar || "",
      version: settings?.version || "",
      description: settings?.description || "",
      url: settings?.url || "",
      email: settings?.email || "",
      phone: settings?.phone || "",
      address: settings?.address || "",
      facebook: settings?.facebook || "",
      instagram: settings?.instagram || "",
      twitter: settings?.twitter || "",
      whatsapp: settings?.whatsapp || "",
      telegram: settings?.telegram || "",
      support_phone: settings?.support_phone || "",
      support_email: settings?.support_email || "",
      support_chat: settings?.support_chat || "",
      support_address: settings?.support_address || "",
      support_hours: settings?.support_hours || "",
      support_whatsapp: settings?.support_whatsapp || "",
      maintenance_mode: settings?.maintenance_mode || false,
      maintenance_message: settings?.maintenance_message || "",
      logo: null as File | null,
      banner: null as File | null,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!settings) return;
      const formData = new FormData();

      // Append all text fields
      formData.append('name_en', values.name_en);
      formData.append('name_ar', values.name_ar);
      formData.append('version', values.version);
      formData.append('description', values.description);
      formData.append('url', values.url);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('address', values.address);
      formData.append('facebook', values.facebook);
      formData.append('instagram', values.instagram);
      formData.append('twitter', values.twitter);
      formData.append('whatsapp', values.whatsapp);
      formData.append('telegram', values.telegram);
      formData.append('maintenance_mode', values.maintenance_mode.toString());

      if (values.support_phone) formData.append('support_phone', values.support_phone);
      if (values.support_email) formData.append('support_email', values.support_email);
      if (values.support_chat) formData.append('support_chat', values.support_chat);
      if (values.support_address) formData.append('support_address', values.support_address);
      if (values.support_hours) formData.append('support_hours', values.support_hours);
      if (values.support_whatsapp) formData.append('support_whatsapp', values.support_whatsapp);
      if (values.maintenance_message) formData.append('maintenance_message', values.maintenance_message);
      if (values.logo) formData.append('logo', values.logo);
      if (values.banner) formData.append('banner', values.banner);

      updateMutation.mutate({ id: settings.id, formData });
    },
  });

  /* ================= HANDLERS ================= */
  const handleEdit = () => {
    if (settings) {
      formik.setValues({
        name_en: settings.name_en,
        name_ar: settings.name_ar,
        version: settings.version,
        description: settings.description,
        url: settings.url,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        facebook: settings.facebook,
        instagram: settings.instagram,
        twitter: settings.twitter,
        whatsapp: settings.whatsapp,
        telegram: settings.telegram,
        support_phone: settings.support_phone || "",
        support_email: settings.support_email || "",
        support_chat: settings.support_chat || "",
        support_address: settings.support_address || "",
        support_hours: settings.support_hours || "",
        support_whatsapp: settings.support_whatsapp || "",
        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message || "",
        logo: null,
        banner: null,
      });
      setLogoPreview(settings.logo || null);
      setBannerPreview(settings.banner || null);
      setIsEditOpen(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      formik.setFieldValue(type, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoPreview(reader.result as string);
        } else {
          setBannerPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMaintenanceToggle = (checked: boolean) => {
    if (!settings) return;

    if (!checked) {
      toggleMaintenanceMutation.mutate({
        id: settings.id,
        data: {
          maintenance_mode: false,
          maintenance_message: settings.maintenance_message
        }
      });
    } else {
      formik.setFieldValue('maintenance_mode', true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">{t("common.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-500">{t("settings.errorLoading")}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
          <p className="text-muted-foreground">{t("settings.subtitle")}</p>
        </div>
        <Button onClick={handleEdit}>
          <Pencil className="w-4 h-4 mr-2" />
          {t("settings.editSetting")}
        </Button>
      </div>

      {/* SETTINGS DISPLAY */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">{t("settings.generalSettings")}</TabsTrigger>
          <TabsTrigger value="contact">{t("settings.contactInfo")}</TabsTrigger>
          <TabsTrigger value="social">{t("settings.socialMedia")}</TabsTrigger>
          <TabsTrigger value="support">{t("settings.supportInfo")}</TabsTrigger>
          <TabsTrigger value="maintenance">{t("settings.maintenance")}</TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.generalSettings")}</CardTitle>
              <CardDescription>{t("settings.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t("settings.appNameEn")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.name_en}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.appNameAr")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.name_ar}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.version")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.version}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.url")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.url}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{t("settings.description")}</Label>
                <p className="text-sm text-muted-foreground">{settings?.description}</p>
              </div>

              {/* LOGO & BANNER */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t("settings.currentLogo")}</Label>
                  {settings?.logo ? (
                    <div className="border rounded-lg p-4 inline-block">
                      <img src={settings.logo} alt="Logo" className="w-32 h-32 object-contain" />
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t("settings.noLogo")}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t("settings.currentBanner")}</Label>
                  {settings?.banner ? (
                    <div className="border rounded-lg p-4">
                      <img src={settings.banner} alt="Banner" className="w-full h-32 object-cover rounded" />
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t("settings.noBanner")}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT TAB */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.contactInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t("settings.email")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.phone")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.phone}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{t("settings.address")}</Label>
                <p className="text-sm text-muted-foreground">{settings?.address}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOCIAL MEDIA TAB */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.socialMedia")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t("settings.facebook")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.facebook || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.instagram")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.instagram || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.twitter")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.twitter || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.whatsapp")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.whatsapp || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.telegram")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.telegram || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUPPORT TAB */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.supportInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t("settings.supportPhone")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.support_phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.supportEmail")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.support_email || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.supportWhatsapp")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.support_whatsapp || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("settings.supportChat")}</Label>
                  <p className="text-sm text-muted-foreground">{settings?.support_chat || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{t("settings.supportAddress")}</Label>
                <p className="text-sm text-muted-foreground">{settings?.support_address || '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t("settings.supportHours")}</Label>
                <p className="text-sm text-muted-foreground">{settings?.support_hours || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MAINTENANCE TAB */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.maintenanceMode")}</CardTitle>
              <CardDescription>{t("settings.enableMaintenance")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t("settings.maintenanceMode")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.enableMaintenance")}</p>
                </div>
                <Switch
                  checked={settings?.maintenance_mode || false}
                  onCheckedChange={handleMaintenanceToggle}
                  disabled={toggleMaintenanceMutation.isPending}
                />
              </div>

              {settings?.maintenance_mode && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t("settings.maintenanceMessage")}</Label>
                  <p className="text-sm p-3 bg-muted rounded-md">{settings.maintenance_message || '-'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("settings.updateSettings")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* GENERAL INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("settings.generalSettings")}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">{t("settings.appNameEn")}</Label>
                  <Input
                    id="name_en"
                    name="name_en"
                    value={formik.values.name_en}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t("settings.appNamePlaceholder")}
                  />
                  {formik.touched.name_en && formik.errors.name_en && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.name_en}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name_ar">{t("settings.appNameAr")}</Label>
                  <Input
                    id="name_ar"
                    name="name_ar"
                    value={formik.values.name_ar}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t("settings.appNamePlaceholder")}
                  />
                  {formik.touched.name_ar && formik.errors.name_ar && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.name_ar}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="version">{t("settings.version")}</Label>
                  <Input
                    id="version"
                    name="version"
                    value={formik.values.version}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t("settings.versionPlaceholder")}
                  />
                  {formik.touched.version && formik.errors.version && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.version}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="url">{t("settings.url")}</Label>
                  <Input
                    id="url"
                    name="url"
                    value={formik.values.url}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t("settings.urlPlaceholder")}
                  />
                  {formik.touched.url && formik.errors.url && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.url}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t("settings.description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.description}</p>
                )}
              </div>

              {/* LOGO & BANNER */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("settings.logo")}</Label>
                  {logoPreview && (
                    <div className="mt-2 mb-2">
                      <img src={logoPreview} alt="Logo preview" className="w-24 h-24 object-contain border rounded p-2" />
                    </div>
                  )}
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'logo')}
                      className="cursor-pointer"
                    />
                    <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label>{t("settings.banner")}</Label>
                  {bannerPreview && (
                    <div className="mt-2 mb-2">
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-24 object-cover rounded border" />
                    </div>
                  )}
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'banner')}
                      className="cursor-pointer"
                    />
                    <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("settings.contactInfo")}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">{t("settings.email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t("settings.emailPlaceholder")}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">{t("settings.phone")}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t("settings.phonePlaceholder")}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address">{t("settings.address")}</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={t("settings.addressPlaceholder")}
                  rows={2}
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.address}</p>
                )}
              </div>
            </div>

            {/* SOCIAL MEDIA */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("settings.socialMedia")}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">{t("settings.facebook")}</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formik.values.facebook}
                    onChange={formik.handleChange}
                    placeholder={t("settings.facebookPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">{t("settings.instagram")}</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formik.values.instagram}
                    onChange={formik.handleChange}
                    placeholder={t("settings.instagramPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">{t("settings.twitter")}</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={formik.values.twitter}
                    onChange={formik.handleChange}
                    placeholder={t("settings.twitterPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">{t("settings.whatsapp")}</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formik.values.whatsapp}
                    onChange={formik.handleChange}
                    placeholder={t("settings.whatsappPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="telegram">{t("settings.telegram")}</Label>
                  <Input
                    id="telegram"
                    name="telegram"
                    value={formik.values.telegram}
                    onChange={formik.handleChange}
                    placeholder={t("settings.telegramPlaceholder")}
                  />
                </div>
              </div>
            </div>

            {/* SUPPORT INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("settings.supportInfo")}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="support_phone">{t("settings.supportPhone")}</Label>
                  <Input
                    id="support_phone"
                    name="support_phone"
                    value={formik.values.support_phone}
                    onChange={formik.handleChange}
                    placeholder={t("settings.supportPhonePlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="support_email">{t("settings.supportEmail")}</Label>
                  <Input
                    id="support_email"
                    name="support_email"
                    type="email"
                    value={formik.values.support_email}
                    onChange={formik.handleChange}
                    placeholder={t("settings.supportEmailPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="support_whatsapp">{t("settings.supportWhatsapp")}</Label>
                  <Input
                    id="support_whatsapp"
                    name="support_whatsapp"
                    value={formik.values.support_whatsapp}
                    onChange={formik.handleChange}
                    placeholder={t("settings.supportWhatsappPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="support_chat">{t("settings.supportChat")}</Label>
                  <Input
                    id="support_chat"
                    name="support_chat"
                    value={formik.values.support_chat}
                    onChange={formik.handleChange}
                    placeholder={t("settings.supportChatPlaceholder")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="support_address">{t("settings.supportAddress")}</Label>
                <Textarea
                  id="support_address"
                  name="support_address"
                  value={formik.values.support_address}
                  onChange={formik.handleChange}
                  placeholder={t("settings.supportAddressPlaceholder")}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="support_hours">{t("settings.supportHours")}</Label>
                <Input
                  id="support_hours"
                  name="support_hours"
                  value={formik.values.support_hours}
                  onChange={formik.handleChange}
                  placeholder={t("settings.supportHoursPlaceholder")}
                />
              </div>
            </div>

            {/* MAINTENANCE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("settings.maintenance")}</h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_mode"
                  checked={formik.values.maintenance_mode}
                  onCheckedChange={(checked) => formik.setFieldValue('maintenance_mode', checked)}
                />
                <Label htmlFor="maintenance_mode" className="cursor-pointer">
                  {t("settings.enableMaintenance")}
                </Label>
              </div>

              {formik.values.maintenance_mode && (
                <div>
                  <Label htmlFor="maintenance_message">{t("settings.maintenanceMessage")}</Label>
                  <Textarea
                    id="maintenance_message"
                    name="maintenance_message"
                    placeholder={t("settings.maintenanceMessagePlaceholder")}
                    value={formik.values.maintenance_message}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={3}
                    className="mt-1"
                  />
                  {formik.touched.maintenance_message && formik.errors.maintenance_message && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.maintenance_message}</p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  {t("common.cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
