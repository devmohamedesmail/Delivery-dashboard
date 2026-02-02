'use client'
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PlaceController from '@/controllers/places-controller';
import type { Place, StoreType } from '@/controllers/places-controller';
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
import { Pencil, Trash2, Search, X, MapPin, Store } from "lucide-react";
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/loading';

export default function Places() {
    const queryClient = useQueryClient();
    const { t, i18n } = useTranslation();
    const { user } = useAuth()
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState<Place | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    /* ================= FETCH PLACES ================= */
    const { data: places, isLoading } = useQuery({
        queryKey: ["places"],
        queryFn: PlaceController.getPlaces,
    });

    /* ================= FETCH STORE TYPES ================= */
    const { data: storeTypes } = useQuery({
        queryKey: ["storeTypes"],
        queryFn: PlaceController.getStoreTypes,
    });

    /* ================= CREATE ================= */
    const createMutation = useMutation({
        mutationFn: PlaceController.createPlace,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["places"] });
            createFormik.resetForm();
            setIsCreateOpen(false);
            toast.success(t("places.createSuccess"));
        },
        onError: (error: any) => {
            console.log("Create error:", error);
            toast.error(error?.response?.data?.message || "Failed to create place");
        },
    });

    /* ================= UPDATE ================= */
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            PlaceController.updatePlace(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["places"] });
            editFormik.resetForm();
            setIsEditOpen(false);
            setEditingPlace(null);
            toast.success(t("places.updateSuccess"));
        },
        onError: (error: any) => {
            console.error("Update error:", error);
            toast.error(error?.response?.data?.message || "Failed to update place");
        },
    });

    /* ================= DELETE ================= */
    const deleteMutation = useMutation({
        mutationFn: PlaceController.deletePlace,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["places"] });
            toast.success(t("places.deleteSuccess"));
        },
        onError: (error: any) => {
            console.error("Delete error:", error);
            toast.error(error?.response?.data?.message || "Failed to delete place");
        },
    });

    /* ================= CREATE VALIDATION ================= */
    const createValidationSchema = Yup.object({
        name: Yup.string().required(t("places.validation.nameRequired")),
        address: Yup.string().required(t("places.validation.addressRequired")),
        latitude: Yup.number().min(-90).max(90),
        longitude: Yup.number().min(-180).max(180),
        store_type_ids: Yup.array()
            .of(Yup.number())
            .min(1, t("places.validation.storeTypeRequired"))
            .required(t("places.validation.storeTypesRequired")),
    });

    /* ================= UPDATE VALIDATION ================= */
    const updateValidationSchema = Yup.object({
        name: Yup.string().required(t("places.validation.nameRequired")),
        address: Yup.string().required(t("places.validation.addressRequired")),
        latitude: Yup.number().min(-90).max(90),
        longitude: Yup.number().min(-180).max(180),
        store_type_ids: Yup.array()
            .of(Yup.number())
            .min(1, t("places.validation.storeTypeRequired")),
    });

    /* ================= CREATE FORMIK ================= */
    const createFormik = useFormik({
        initialValues: {
            name: "",
            address: "",
            latitude: "",
            longitude: "",
            store_type_ids: [] as number[],
        },
        validationSchema: createValidationSchema,
        onSubmit: (values) => {
            createMutation.mutate({
                name: values.name,
                address: values.address,
                latitude: Number(values.latitude) || 0,
                longitude: Number(values.longitude) || 0,
                store_type_ids: values.store_type_ids,
            });
        },
    });

    /* ================= EDIT FORMIK ================= */
    const editFormik = useFormik({
        initialValues: {
            name: "",
            address: "",
            latitude: "",
            longitude: "",
            store_type_ids: [] as number[],
        },
        validationSchema: updateValidationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            if (!editingPlace) return;
            updateMutation.mutate({
                id: editingPlace.id,
                data: {
                    name: values.name,
                    address: values.address,
                    latitude: Number(values.latitude) || 0,
                    longitude: Number(values.longitude) || 0,
                    store_type_ids: values.store_type_ids,
                },
            });
        },
    });

    /* ================= HANDLE EDIT ================= */
    const handleEdit = (place: Place) => {
        setEditingPlace(place);
        const selectedStoreTypeIds = place.storeTypes?.map(st => st.store_type_id) || [];
        editFormik.setValues({
            name: place.name,
            address: place.address,
            latitude: place.latitude?.toString() || "",
            longitude: place.longitude?.toString() || "",
            store_type_ids: selectedStoreTypeIds,
        });
        setIsEditOpen(true);
    };

    /* ================= HANDLE STORE TYPE TOGGLE ================= */
    const handleStoreTypeToggle = (storeTypeId: number, formik: any) => {
        const currentIds = formik.values.store_type_ids;
        if (currentIds.includes(storeTypeId)) {
            formik.setFieldValue(
                'store_type_ids',
                currentIds.filter((id: number) => id !== storeTypeId)
            );
        } else {
            formik.setFieldValue('store_type_ids', [...currentIds, storeTypeId]);
        }
    };

    /* ================= SEARCH FILTER ================= */
    const filteredPlaces = useMemo(() => {
        if (!places) return [];
        if (!searchQuery.trim()) return places;

        const query = searchQuery.toLowerCase();
        return places.filter((place: Place) => {
            const nameMatch = place.name?.toLowerCase().includes(query);
            const addressMatch = place.address?.toLowerCase().includes(query);
            return nameMatch || addressMatch;
        });
    }, [places, searchQuery]);

    /* ================= STATS ================= */
    const stats = useMemo(() => {
        const totalPlaces = places?.length || 0;
        const totalStoreTypes = storeTypes?.length || 0;
        return { totalPlaces, totalStoreTypes };
    }, [places, storeTypes]);

    return (
        <div className="p-6 space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("places.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("places.subtitle")}</p>
                </div>

                {/* CREATE DIALOG */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="shadow-md">
                            <MapPin className="w-4 h-4 mr-2" />
                            {t("places.addNewPlace")}
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t("places.addNewPlace")}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={createFormik.handleSubmit} className="space-y-4">
                            <div>
                                <Label>{t("places.placeName")}</Label>
                                <Input
                                    name="name"
                                    placeholder={t("places.enterPlaceName")}
                                    onChange={createFormik.handleChange}
                                    value={createFormik.values.name}
                                />
                                {createFormik.touched.name && createFormik.errors.name && (
                                    <p className="text-sm text-red-500">{createFormik.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label>{t("places.address")}</Label>
                                <Input
                                    name="address"
                                    placeholder={t("places.enterFullAddress")}
                                    onChange={createFormik.handleChange}
                                    value={createFormik.values.address}
                                />
                                {createFormik.touched.address && createFormik.errors.address && (
                                    <p className="text-sm text-red-500">{createFormik.errors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{t("places.latitude")}</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        placeholder={t("places.latitudePlaceholder")}
                                        onChange={createFormik.handleChange}
                                        value={createFormik.values.latitude}
                                    />
                                    {createFormik.touched.latitude && createFormik.errors.latitude && (
                                        <p className="text-sm text-red-500">{createFormik.errors.latitude}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>{t("places.longitude")}</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        placeholder={t("places.longitudePlaceholder")}
                                        onChange={createFormik.handleChange}
                                        value={createFormik.values.longitude}
                                    />
                                    {createFormik.touched.longitude && createFormik.errors.longitude && (
                                        <p className="text-sm text-red-500">{createFormik.errors.longitude}</p>
                                    )}
                                </div>
                            </div>

                            {/* STORE TYPES MULTI-SELECT */}
                            <div>
                                <Label>{t("places.storeTypes")}</Label>
                                <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto bg-muted/30">
                                    {storeTypes?.map((storeType: StoreType) => (
                                        <div key={storeType.id} className="flex items-center space-x-2 hover:bg-accent/50 p-2 rounded transition-colors">
                                            <input
                                                type="checkbox"
                                                id={`create-store-${storeType.id}`}
                                                checked={createFormik.values.store_type_ids.includes(storeType.id)}
                                                onChange={() => handleStoreTypeToggle(storeType.id, createFormik)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                            <label
                                                htmlFor={`create-store-${storeType.id}`}
                                                className="text-sm cursor-pointer flex-1"
                                            >
                                                {storeType.name_en} ({storeType.name_ar})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {createFormik.touched.store_type_ids && createFormik.errors.store_type_ids && (
                                    <p className="text-sm text-red-500">{createFormik.errors.store_type_ids}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">
                                        {t("common.cancel")}
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? t("common.creating") : t("common.save")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* STATS CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("places.totalPlaces")}
                        </CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPlaces}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {filteredPlaces.length !== stats.totalPlaces && (
                                <span>{filteredPlaces.length} {t("places.searchResults").toLowerCase()}</span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("places.storeTypes")}
                        </CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStoreTypes}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("common.all").toLowerCase()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* SEARCH BAR */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("places.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={t("places.clearSearch")}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* EDIT DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("places.editPlace")}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={editFormik.handleSubmit} className="space-y-4">
                        <div>
                            <Label>{t("places.placeName")}</Label>
                            <Input
                                name="name"
                                onChange={editFormik.handleChange}
                                value={editFormik.values.name}
                            />
                            {editFormik.touched.name && editFormik.errors.name && (
                                <p className="text-sm text-red-500">{editFormik.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label>{t("places.address")}</Label>
                            <Input
                                name="address"
                                placeholder={t("places.enterFullAddress")}
                                onChange={editFormik.handleChange}
                                value={editFormik.values.address}
                            />
                            {editFormik.touched.address && editFormik.errors.address && (
                                <p className="text-sm text-red-500">{editFormik.errors.address}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>{t("places.latitude")}</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    placeholder={t("places.latitudePlaceholder")}
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.latitude}
                                />
                                {editFormik.touched.latitude && editFormik.errors.latitude && (
                                    <p className="text-sm text-red-500">{editFormik.errors.latitude}</p>
                                )}
                            </div>

                            <div>
                                <Label>{t("places.longitude")}</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    placeholder={t("places.longitudePlaceholder")}
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.longitude}
                                />
                                {editFormik.touched.longitude && editFormik.errors.longitude && (
                                    <p className="text-sm text-red-500">{editFormik.errors.longitude}</p>
                                )}
                            </div>
                        </div>

                        {/* STORE TYPES MULTI-SELECT */}
                        <div>
                            <Label>{t("places.storeTypes")}</Label>
                            <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto bg-muted/30">
                                {storeTypes?.map((storeType: StoreType) => (
                                    <div key={storeType.id} className="flex items-center space-x-2 hover:bg-accent/50 p-2 rounded transition-colors">
                                        <input
                                            type="checkbox"
                                            id={`edit-store-${storeType.id}`}
                                            checked={editFormik.values.store_type_ids.includes(storeType.id)}
                                            onChange={() => handleStoreTypeToggle(storeType.id, editFormik)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <label
                                            htmlFor={`edit-store-${storeType.id}`}
                                            className="text-sm cursor-pointer flex-1"
                                        >
                                            {storeType.name_en} ({storeType.name_ar})
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {editFormik.touched.store_type_ids && editFormik.errors.store_type_ids && (
                                <p className="text-sm text-red-500">{editFormik.errors.store_type_ids}</p>
                            )}
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

            {/* TABLE */}
            <Card className="shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className='text-center font-semibold'>{t("common.id")}</TableHead>
                            <TableHead className='text-center font-semibold'>{t("places.placeName")}</TableHead>
                            <TableHead className='text-center font-semibold'>{t("places.address")}</TableHead>
                            <TableHead className='text-center font-semibold'>{t("places.storeTypes")}</TableHead>
                            <TableHead className='text-center font-semibold'>{t("common.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span className="text-muted-foreground">{t("common.loading")}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                           
                        ) : filteredPlaces && filteredPlaces.length > 0 ? (
                            filteredPlaces.map((place: Place) => (
                                <TableRow key={place.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className='text-center font-medium'>{place.id}</TableCell>
                                    <TableCell className='text-center font-medium'>{place.name}</TableCell>
                                    <TableCell className='text-center text-muted-foreground'>{place.address}</TableCell>
                                    <TableCell className='text-center'>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {place.storeTypes && place.storeTypes.length > 0 ? (
                                                place.storeTypes.map((st) => (
                                                    <Badge key={st.id} variant="secondary" className="shadow-sm">
                                                        {i18n.language === "ar" ? st.storeType.name_ar : st.storeType.name_en}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-sm">{t("places.noStoreTypes")}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(place)}
                                                className="hover:bg-primary hover:text-primary-foreground transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => deleteMutation.mutate(place.id)}
                                                disabled={deleteMutation.isPending}
                                                className="shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        {searchQuery ? (
                                            <>
                                                <Search className="w-12 h-12 text-muted-foreground/30" />
                                                <p className="text-lg font-medium text-muted-foreground">{t("places.noResults")}</p>
                                                <p className="text-sm text-muted-foreground">{t("places.tryDifferentSearch")}</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSearchQuery('')}
                                                    className="mt-2"
                                                >
                                                    {t("places.clearSearch")}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="w-12 h-12 text-muted-foreground/30" />
                                                <p className="text-lg font-medium text-muted-foreground">{t("places.noPlacesFound")}</p>
                                                <p className="text-sm text-muted-foreground">{t("places.adjustSearch")}</p>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
