'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import StoreTypesController from "@/controllers/store-types-controller";
import type { StoreType } from "@/controllers/store-types-controller";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import * as Yup from 'yup'
import { useFormik } from 'formik'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus } from "lucide-react";
import Loading from "@/components/ui/loading";

export default function StoreTypesPage() {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingStoreType, setEditingStoreType] = useState<StoreType | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    /* ================= FETCH STORE TYPES ================= */
    const { data, isLoading } = useQuery({
        queryKey: ['store-types'],
        queryFn: StoreTypesController.getStoreTypes,
    });

    /* ================= CREATE MUTATION ================= */
    const createMutation = useMutation({
        mutationFn: StoreTypesController.createStoreType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-types'] });
            createFormik.resetForm();
            setIsCreateOpen(false);
            setPreviewImage(null);
            toast.success(t('store-types.createSuccess') || "Store type created successfully!");
        },
        onError: (error: any) => {
            console.log("Create error:", error);
            toast.error(error?.response?.data?.message || "Failed to create store type");
        },
    });

    /* ================= UPDATE MUTATION ================= */
    const updateMutation = useMutation({
        mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
            StoreTypesController.updateStoreType(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-types'] });
            editFormik.resetForm();
            setIsEditOpen(false);
            setEditingStoreType(null);
            setPreviewImage(null);
            toast.success(t('store-types.updateSuccess') || "Store type updated successfully!");
        },
        onError: (error: any) => {
            console.log("Update error:", error);
            toast.error(error?.response?.data?.message || "Failed to update store type");
        },
    });

    /* ================= DELETE MUTATION ================= */
    const deleteMutation = useMutation({
        mutationFn: StoreTypesController.deleteStoreType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-types'] });
            toast.success(t('store-types.deleteSuccess') || "Store type deleted successfully!");
        },
        onError: (error: any) => {
            console.log("Delete error:", error);
            toast.error(error?.response?.data?.message || "Failed to delete store type");
        },
    });

    /* ================= CREATE FORMIK ================= */
    const createFormik = useFormik({
        initialValues: {
            name_ar: '',
            name_en: '',
            description_ar: '',
            description_en: '',
            image: null as File | null,
        },
        validationSchema: Yup.object({
            name_ar: Yup.string().required(t('store-types.validation.titleAr')),
            name_en: Yup.string().required(t('store-types.validation.titleEn')),
            image: Yup.mixed().required(t('store-types.validation.imageRequired')),
        }),
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('name_ar', values.name_ar);
            formData.append('name_en', values.name_en);
            formData.append('description_ar', values.description_ar);
            formData.append('description_en', values.description_en);

            if (values.image) {
                formData.append('image', values.image);
            }

            createMutation.mutate(formData);
        },
    });

    /* ================= EDIT FORMIK ================= */
    const editFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name_ar: editingStoreType?.name_ar || '',
            name_en: editingStoreType?.name_en || '',
            description_ar: editingStoreType?.description_ar || '',
            description_en: editingStoreType?.description_en || '',
            image: null as File | null,
        },
        validationSchema: Yup.object({
            name_ar: Yup.string().required(t('store-types.validation.titleAr')),
            name_en: Yup.string().required(t('store-types.validation.titleEn')),
        }),
        onSubmit: async (values) => {
            if (!editingStoreType) return;

            const formData = new FormData();
            formData.append('name_ar', values.name_ar);
            formData.append('name_en', values.name_en);
            formData.append('description_ar', values.description_ar);
            formData.append('description_en', values.description_en);

            if (values.image) {
                formData.append('image', values.image);
            }

            updateMutation.mutate({ id: editingStoreType.id, formData });
        },
    });

    /* ================= HANDLERS ================= */
    const handleEdit = (storeType: StoreType) => {
        setEditingStoreType(storeType);
        setPreviewImage(storeType.image || null);
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm(t('common.confirm_delete') || 'Are you sure you want to delete this store type?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, formik: any) => {
        const file = e.target.files?.[0];
        if (file) {
            formik.setFieldValue('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t("store-types.store_type")}</h1>

                {/* CREATE DIALOG */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {t("store-types.add")}
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t("store-types.add")}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={createFormik.handleSubmit} className="space-y-4">
                            <div>
                                <Label>{t('store-types.titleAr')}</Label>
                                <Input
                                    name="name_ar"
                                    value={createFormik.values.name_ar}
                                    onChange={createFormik.handleChange}
                                    onBlur={createFormik.handleBlur}
                                />
                                {createFormik.touched.name_ar && createFormik.errors.name_ar && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {createFormik.errors.name_ar}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label>{t('store-types.titleEn')}</Label>
                                <Input
                                    name="name_en"
                                    value={createFormik.values.name_en}
                                    onChange={createFormik.handleChange}
                                    onBlur={createFormik.handleBlur}
                                />
                                {createFormik.touched.name_en && createFormik.errors.name_en && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {createFormik.errors.name_en}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label>{t('store-types.descriptionAr')}</Label>
                                <Input
                                    name="description_ar"
                                    value={createFormik.values.description_ar}
                                    onChange={createFormik.handleChange}
                                    onBlur={createFormik.handleBlur}
                                />
                            </div>

                            <div>
                                <Label>{t('store-types.descriptionEn')}</Label>
                                <Input
                                    name="description_en"
                                    value={createFormik.values.description_en}
                                    onChange={createFormik.handleChange}
                                    onBlur={createFormik.handleBlur}
                                />
                            </div>

                            <div>
                                {previewImage && (
                                    <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded mb-2" />
                                )}
                                <Label>{t('common.selectImage')}</Label>
                                <Input
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, createFormik)}
                                    onBlur={createFormik.handleBlur}
                                />
                                {createFormik.touched.image && createFormik.errors.image && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {createFormik.errors.image as string}
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">
                                        {t("common.cancel")}
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? t("common.saving") || "Saving..." : t("common.save")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* GRID VIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-10"><Loading /></div>
                ) : data && data.length > 0 ? (
                    data.map((storeType: StoreType) => (
                        <div key={storeType.id} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                            {storeType.image && (
                                <img
                                    src={storeType.image}
                                    alt={i18n.language === 'ar' ? storeType.name_ar : storeType.name_en}
                                    className="w-full h-48 object-cover rounded"
                                />
                            )}

                            <h2 className="text-xl font-semibold">
                                {i18n.language === 'ar' ? storeType.name_ar : storeType.name_en}
                            </h2>

                            {(storeType.description_ar || storeType.description_en) && (
                                <p className="text-gray-600 text-sm">
                                    {i18n.language === 'ar' ? storeType.description_ar : storeType.description_en}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(storeType)}
                                >
                                    <Pencil className="w-4 h-4 mr-1" />
                                    {t('common.edit')}
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(storeType.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    {t('common.delete')}
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No store types found
                    </div>
                )}
            </div>

            {/* EDIT DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('common.edit')} {t("store-types.store_type")}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={editFormik.handleSubmit} className="space-y-4">
                        <div>
                            <Label>{t('store-types.titleAr')}</Label>
                            <Input
                                name="name_ar"
                                value={editFormik.values.name_ar}
                                onChange={editFormik.handleChange}
                                onBlur={editFormik.handleBlur}
                            />
                            {editFormik.touched.name_ar && editFormik.errors.name_ar && (
                                <p className="text-red-500 text-xs mt-1">
                                    {editFormik.errors.name_ar}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label>{t('store-types.titleEn')}</Label>
                            <Input
                                name="name_en"
                                value={editFormik.values.name_en}
                                onChange={editFormik.handleChange}
                                onBlur={editFormik.handleBlur}
                            />
                            {editFormik.touched.name_en && editFormik.errors.name_en && (
                                <p className="text-red-500 text-xs mt-1">
                                    {editFormik.errors.name_en}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label>{t('store-types.descriptionAr')}</Label>
                            <Input
                                name="description_ar"
                                value={editFormik.values.description_ar}
                                onChange={editFormik.handleChange}
                                onBlur={editFormik.handleBlur}
                            />
                        </div>

                        <div>
                            <Label>{t('store-types.descriptionEn')}</Label>
                            <Input
                                name="description_en"
                                value={editFormik.values.description_en}
                                onChange={editFormik.handleChange}
                                onBlur={editFormik.handleBlur}
                            />
                        </div>

                        <div>
                            {(previewImage || editingStoreType?.image) && (
                                <img
                                    src={previewImage || editingStoreType?.image}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded mb-2"
                                />
                            )}
                            <Label>{t('common.selectImage')}</Label>
                            <Input
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, editFormik)}
                                onBlur={editFormik.handleBlur}
                            />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">
                                    {t("common.cancel")}
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? t("common.updating") : t("common.update")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}