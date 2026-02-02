'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StoreController from '@/controllers/stores-controller';
import PlaceController from '@/controllers/places-controller';
import StoreTypesController from '@/controllers/store-types-controller';
import type { Store } from '@/controllers/stores-controller';
import type { Place } from '@/controllers/places-controller';
import type { StoreType } from '@/controllers/store-types-controller';
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
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
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, CheckCircle, XCircle, Star } from "lucide-react";
import toast from 'react-hot-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCookies } from 'react-cookie';

export default function StoresPage() {
    const queryClient = useQueryClient();
    const { t, i18n } = useTranslation();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [cookies] = useCookies(['access_token']);
    console.log("cookies", cookies?.access_token);
    /* ================= FETCH STORES ================= */
    const { data: stores, isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: StoreController.getStores,
    });

    /* ================= FETCH PLACES ================= */
    const { data: places } = useQuery({
        queryKey: ["places"],
        queryFn: PlaceController.getPlaces,
    });

    /* ================= FETCH STORE TYPES ================= */
    const { data: storeTypes } = useQuery({
        queryKey: ["storeTypes"],
        queryFn: StoreTypesController.getStoreTypes,
    });

    /* ================= CREATE MUTATION ================= */
    const createMutation = useMutation({
        mutationFn: StoreController.createStore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
            createFormik.resetForm();
            setIsCreateOpen(false);
            setLogoPreview(null);
            setBannerPreview(null);
            toast.success("Store created successfully!");
        },
        onError: (error: any) => {
            console.log("Create error:", error);
            toast.error(error?.response?.data?.message || "Failed to create store");
        },
    });

    /* ================= UPDATE MUTATION ================= */
    const updateMutation = useMutation({
        mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
            StoreController.updateStore(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
            editFormik.resetForm();
            setIsEditOpen(false);
            setEditingStore(null);
            setLogoPreview(null);
            setBannerPreview(null);
            toast.success("Store updated successfully!");
        },
        onError: (error: any) => {
            console.log("Update error:", error);
            toast.error(error?.response?.data?.message || "Failed to update store");
        },
    });

    /* ================= DELETE MUTATION ================= */
    const deleteMutation = useMutation({
        mutationFn: StoreController.deleteStore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
            toast.success("Store deleted successfully!");
        },
        onError: (error: any) => {
            console.log("Delete error:", error);
            toast.error(error?.response?.data?.message || "Failed to delete store");
        },
    });

    /* ================= TOGGLE STATUS MUTATION ================= */
    const toggleStatusMutation = useMutation({
        mutationFn: StoreController.toggleStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
            toast.success("Store status updated!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update status");
        },
    });

    /* ================= VERIFY MUTATION ================= */
    const verifyMutation = useMutation({
        mutationFn: StoreController.verifyStore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
            toast.success("Store verification updated!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to verify store");
        },
    });

    /* ================= TOGGLE FEATURED MUTATION ================= */
    const toggleFeaturedMutation = useMutation({
        mutationFn: StoreController.toggleFeatured,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
            toast.success("Featured status updated!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update featured status");
        },
    });

    /* ================= VALIDATION SCHEMAS ================= */
    const createValidationSchema = Yup.object({
        name: Yup.string().required("Store name is required"),
        place_id: Yup.number().required("Place is required"),
        store_type_id: Yup.number().required("Store type is required"),
        phone: Yup.string(),
        address: Yup.string(),
        start_time: Yup.string(),
        end_time: Yup.string(),
    });

    /* ================= CREATE FORMIK ================= */
    const createFormik = useFormik({
        initialValues: {
            name: "",
            place_id: "",
            store_type_id: "",
            phone: "",
            address: "",
            start_time: "",
            end_time: "",
            logo: null as File | null,
            banner: null as File | null,
        },
        validationSchema: createValidationSchema,
        onSubmit: (values) => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('place_id', values.place_id);
            formData.append('store_type_id', values.store_type_id);
            if (values.phone) formData.append('phone', values.phone);
            if (values.address) formData.append('address', values.address);
            if (values.start_time) formData.append('start_time', values.start_time);
            if (values.end_time) formData.append('end_time', values.end_time);
            if (values.logo) formData.append('logo', values.logo);
            if (values.banner) formData.append('banner', values.banner);

            createMutation.mutate(formData);
        },
    });

    /* ================= EDIT FORMIK ================= */
    const editFormik = useFormik({
        initialValues: {
            name: "",
            place_id: "",
            store_type_id: "",
            phone: "",
            address: "",
            start_time: "",
            end_time: "",
            logo: null as File | null,
            banner: null as File | null,
        },
        validationSchema: createValidationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            if (!editingStore) return;
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('place_id', values.place_id);
            formData.append('store_type_id', values.store_type_id);
            if (values.phone) formData.append('phone', values.phone);
            if (values.address) formData.append('address', values.address);
            if (values.start_time) formData.append('start_time', values.start_time);
            if (values.end_time) formData.append('end_time', values.end_time);
            if (values.logo) formData.append('logo', values.logo);
            if (values.banner) formData.append('banner', values.banner);

            updateMutation.mutate({ id: editingStore.id, formData });
        },
    });

    /* ================= HANDLERS ================= */
    const handleEdit = (store: Store) => {
        setEditingStore(store);
        editFormik.setValues({
            name: store.name,
            place_id: store.place_id.toString(),
            store_type_id: store.store_type_id.toString(),
            phone: store.phone || "",
            address: store.address || "",
            start_time: store.start_time || "",
            end_time: store.end_time || "",
            logo: null,
            banner: null,
        });
        setLogoPreview(store.logo || null);
        setBannerPreview(store.banner || null);
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        console.log("store id", id);
        if (confirm('Are you sure you want to delete this store?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner', formik: any) => {
        const file = e.target.files?.[0];
        if (file) {
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

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t("stores.title")}</h1>

                {/* CREATE DIALOG */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Store
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t("stores.addNewStore")}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={createFormik.handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{t("stores.store_name")}</Label>
                                    <Input
                                        name="name"
                                        onChange={createFormik.handleChange}
                                        value={createFormik.values.name}
                                    />
                                    {createFormik.touched.name && createFormik.errors.name && (
                                        <p className="text-sm text-red-500">{createFormik.errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        name="phone"
                                        onChange={createFormik.handleChange}
                                        value={createFormik.values.phone}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Address</Label>
                                <Input
                                    name="address"
                                    onChange={createFormik.handleChange}
                                    value={createFormik.values.address}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Place *</Label>
                                    <Select
                                        value={createFormik.values.place_id}
                                        onValueChange={(value) => createFormik.setFieldValue('place_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a place" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {places?.map((place: Place) => (
                                                <SelectItem key={place.id} value={place.id.toString()}>
                                                    {place.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createFormik.touched.place_id && createFormik.errors.place_id && (
                                        <p className="text-sm text-red-500">{createFormik.errors.place_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>Store Type *</Label>
                                    <Select
                                        value={createFormik.values.store_type_id}
                                        onValueChange={(value) => createFormik.setFieldValue('store_type_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select store type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {storeTypes?.map((type: StoreType) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {i18n.language === 'ar' ? type.name_ar : type.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createFormik.touched.store_type_id && createFormik.errors.store_type_id && (
                                        <p className="text-sm text-red-500">{createFormik.errors.store_type_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        name="start_time"
                                        onChange={createFormik.handleChange}
                                        value={createFormik.values.start_time}
                                    />
                                </div>

                                <div>
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        name="end_time"
                                        onChange={createFormik.handleChange}
                                        value={createFormik.values.end_time}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    {logoPreview && (
                                        <img src={logoPreview} alt="Logo preview" className="w-24 h-24 object-cover rounded mb-2" />
                                    )}
                                    <Label>Logo</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'logo', createFormik)}
                                    />
                                </div>

                                <div>
                                    {bannerPreview && (
                                        <img src={bannerPreview} alt="Banner preview" className="w-full h-24 object-cover rounded mb-2" />
                                    )}
                                    <Label>Banner</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'banner', createFormik)}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Creating..." : "Create Store"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* EDIT DIALOG - Similar structure to create */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Store</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={editFormik.handleSubmit} className="space-y-4">
                        {/* Same fields as create form */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>{t("stores.store_name")}</Label>
                                <Input
                                    name="name"
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.name}
                                />
                            </div>

                            <div>
                                <Label>Phone</Label>
                                <Input
                                    name="phone"
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.phone}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Address</Label>
                            <Input
                                name="address"
                                onChange={editFormik.handleChange}
                                value={editFormik.values.address}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Place *</Label>
                                <Select
                                    value={editFormik.values.place_id}
                                    onValueChange={(value) => editFormik.setFieldValue('place_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {places?.map((place: Place) => (
                                            <SelectItem key={place.id} value={place.id.toString()}>
                                                {place.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Store Type *</Label>
                                <Select
                                    value={editFormik.values.store_type_id}
                                    onValueChange={(value) => editFormik.setFieldValue('store_type_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {storeTypes?.map((type: StoreType) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {i18n.language === 'ar' ? type.name_ar : type.name_en}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    name="start_time"
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.start_time}
                                />
                            </div>

                            <div>
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    name="end_time"
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.end_time}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                {logoPreview && (
                                    <img src={logoPreview} alt="Logo" className="w-24 h-24 object-cover rounded mb-2" />
                                )}
                                <Label>Logo</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'logo', editFormik)}
                                />
                            </div>

                            <div>
                                {bannerPreview && (
                                    <img src={bannerPreview} alt="Banner" className="w-full h-24 object-cover rounded mb-2" />
                                )}
                                <Label>Banner</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'banner', editFormik)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Updating..." : "Update Store"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* TABLE */}
            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("common.id")}</TableHead>
                            <TableHead>{t("stores.logo")}</TableHead>
                            <TableHead>{t("stores.store_name")}</TableHead>
                            <TableHead>{t("stores.store_type")}</TableHead>
                            <TableHead>{t("stores.place")}</TableHead>
                            <TableHead>{t("stores.phone")}</TableHead>
                            <TableHead>{t("stores.rating")}</TableHead>
                            <TableHead>{t("stores.active")}</TableHead>
                            <TableHead>{t("stores.verified")}</TableHead>
                            <TableHead>{t("stores.featured")}</TableHead>
                            <TableHead>{t("stores.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : stores && stores.length > 0 ? (
                            stores.map((store: Store) => (
                                <TableRow key={store.id}>
                                    <TableCell>{store.id}</TableCell>
                                    <TableCell>
                                        {store.logo && (
                                            <img src={store.logo} alt={store.name} className="w-10 h-10 object-cover rounded" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{store.name}</TableCell>
                                    <TableCell>
                                        {store.storeType && (
                                            <Badge variant="secondary">
                                                {i18n.language === 'ar' ? store.storeType.name_ar : store.storeType.name_en}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {store.place && <Badge variant="outline">{store.place.name}</Badge>}
                                    </TableCell>
                                    <TableCell>{store.phone || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            {store.rating?.toFixed(1) || '0.0'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={store.is_active}
                                            onCheckedChange={() => toggleStatusMutation.mutate(store.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => verifyMutation.mutate(store.id)}
                                        >
                                            {store.is_verified ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-400" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleFeaturedMutation.mutate(store.id)}
                                        >
                                            <Star className={`w-5 h-5 ${store.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(store)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(store.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center">
                                    No stores found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}