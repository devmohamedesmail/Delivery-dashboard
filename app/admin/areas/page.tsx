'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AreaController from '@/controllers/areas-controller';
import PlaceController from '@/controllers/places-controller';
import type { Area } from '@/controllers/areas-controller';
import type { Place } from '@/controllers/places-controller';
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
import { Pencil, Trash2, Plus } from "lucide-react";
import toast from 'react-hot-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AreasPage() {
    const queryClient = useQueryClient();
    const { t, i18n } = useTranslation();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<Area | null>(null);

    /* ================= FETCH AREAS ================= */
    const { data: areas, isLoading } = useQuery({
        queryKey: ["areas"],
        queryFn: AreaController.getAreas,
    });

    /* ================= FETCH PLACES ================= */
    const { data: places } = useQuery({
        queryKey: ["places"],
        queryFn: PlaceController.getPlaces,
    });

    /* ================= CREATE MUTATION ================= */
    const createMutation = useMutation({
        mutationFn: AreaController.createArea,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["areas"] });
            createFormik.resetForm();
            setIsCreateOpen(false);
            toast.success(t('areas.createSuccess') || "Area created successfully!");
        },
        onError: (error: any) => {
            console.log("Create error:", error);
            toast.error(error?.response?.data?.message || "Failed to create area");
        },
    });

    /* ================= UPDATE MUTATION ================= */
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            AreaController.updateArea(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["areas"] });
            editFormik.resetForm();
            setIsEditOpen(false);
            setEditingArea(null);
            toast.success(t('areas.updateSuccess') || "Area updated successfully!");
        },
        onError: (error: any) => {
            console.log("Update error:", error);
            toast.error(error?.response?.data?.message || "Failed to update area");
        },
    });

    /* ================= DELETE MUTATION ================= */
    const deleteMutation = useMutation({
        mutationFn: AreaController.deleteArea,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["areas"] });
            toast.success(t('areas.deleteSuccess') || "Area deleted successfully!");
        },
        onError: (error: any) => {
            console.log("Delete error:", error);
            toast.error(error?.response?.data?.message || "Failed to delete area");
        },
    });

    /* ================= CREATE VALIDATION ================= */
    const createValidationSchema = Yup.object({
        name: Yup.string().required(t("areas.validation.nameRequired")),
        area_code: Yup.string(),
        description: Yup.string(),
        price: Yup.number().required(t("areas.validation.priceRequired")).min(0, t("areas.validation.priceMin")),
        place_id: Yup.number().required(t("areas.validation.placeRequired")),
    });

    /* ================= UPDATE VALIDATION ================= */
    const updateValidationSchema = Yup.object({
        name: Yup.string().required(t("areas.validation.nameRequired")),
        area_code: Yup.string(),
        description: Yup.string(),
        price: Yup.number().required(t("areas.validation.priceRequired")).min(0, t("areas.validation.priceMin")),
        place_id: Yup.number().required(t("areas.validation.placeRequired")),
    });

    /* ================= CREATE FORMIK ================= */
    const createFormik = useFormik({
        initialValues: {
            name: "",
            area_code: "",
            description: "",
            price: "",
            place_id: "",
        },
        validationSchema: createValidationSchema,
        onSubmit: (values) => {
            createMutation.mutate({
                name: values.name,
                area_code: values.area_code || undefined,
                description: values.description || undefined,
                price: Number(values.price),
                place_id: Number(values.place_id),
            });
        },
    });

    /* ================= EDIT FORMIK ================= */
    const editFormik = useFormik({
        initialValues: {
            name: "",
            area_code: "",
            description: "",
            price: "",
            place_id: "",
        },
        validationSchema: updateValidationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            if (!editingArea) return;
            updateMutation.mutate({
                id: editingArea.id,
                data: {
                    name: values.name,
                    area_code: values.area_code || undefined,
                    description: values.description || undefined,
                    price: Number(values.price),
                    place_id: Number(values.place_id),
                },
            });
        },
    });

    /* ================= HANDLE EDIT ================= */
    const handleEdit = (area: Area) => {
        setEditingArea(area);
        editFormik.setValues({
            name: area.name,
            area_code: area.area_code || "",
            description: area.description || "",
            price: area.price.toString(),
            place_id: area.place_id.toString(),
        });
        setIsEditOpen(true);
    };

    /* ================= HANDLE DELETE ================= */
    const handleDelete = (id: number) => {
        if (confirm(t('common.confirm_delete') || 'Are you sure you want to delete this area?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t("areas.title") || "Areas"}</h1>

                {/* CREATE DIALOG */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {t("areas.addNewArea") || "Add New Area"}
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{t("areas.addNewArea") || "Add New Area"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={createFormik.handleSubmit} className="space-y-4">
                            <div>
                                <Label>{t("areas.name") || "Area Name"}</Label>
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
                                <Label>{t("areas.areaCode") || "Area Code"}</Label>
                                <Input
                                    name="area_code"
                                    onChange={createFormik.handleChange}
                                    value={createFormik.values.area_code}
                                />
                                {createFormik.touched.area_code && createFormik.errors.area_code && (
                                    <p className="text-sm text-red-500">{createFormik.errors.area_code}</p>
                                )}
                            </div>

                            <div>
                                <Label>{t("areas.description") || "Description"}</Label>
                                <Input
                                    name="description"
                                    onChange={createFormik.handleChange}
                                    value={createFormik.values.description}
                                />
                                {createFormik.touched.description && createFormik.errors.description && (
                                    <p className="text-sm text-red-500">{createFormik.errors.description}</p>
                                )}
                            </div>

                            <div>
                                <Label>{t("areas.price") || "Price"}</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    onChange={createFormik.handleChange}
                                    value={createFormik.values.price}
                                />
                                {createFormik.touched.price && createFormik.errors.price && (
                                    <p className="text-sm text-red-500">{createFormik.errors.price}</p>
                                )}
                            </div>

                            <div>
                                <Label>{t("areas.place") || "Place"}</Label>
                                <Select
                                    value={createFormik.values.place_id}
                                    onValueChange={(value) => createFormik.setFieldValue('place_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("areas.selectPlace") || "Select a place"} />
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

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">
                                        {t("common.cancel")}
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? t("common.saving") : t("common.save")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* EDIT DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("areas.editArea") || "Edit Area"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={editFormik.handleSubmit} className="space-y-4">
                        <div>
                            <Label>{t("areas.name") || "Area Name"}</Label>
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
                            <Label>{t("areas.areaCode") || "Area Code"}</Label>
                            <Input
                                name="area_code"
                                onChange={editFormik.handleChange}
                                value={editFormik.values.area_code}
                            />
                            {editFormik.touched.area_code && editFormik.errors.area_code && (
                                <p className="text-sm text-red-500">{editFormik.errors.area_code}</p>
                            )}
                        </div>

                        <div>
                            <Label>{t("areas.description") || "Description"}</Label>
                            <Input
                                name="description"
                                onChange={editFormik.handleChange}
                                value={editFormik.values.description}
                            />
                            {editFormik.touched.description && editFormik.errors.description && (
                                <p className="text-sm text-red-500">{editFormik.errors.description}</p>
                            )}
                        </div>

                        <div>
                            <Label>{t("areas.price") || "Price"}</Label>
                            <Input
                                type="number"
                                step="0.01"
                                name="price"
                                onChange={editFormik.handleChange}
                                value={editFormik.values.price}
                            />
                            {editFormik.touched.price && editFormik.errors.price && (
                                <p className="text-sm text-red-500">{editFormik.errors.price}</p>
                            )}
                        </div>

                        <div>
                            <Label>{t("areas.place") || "Place"}</Label>
                            <Select
                                value={editFormik.values.place_id}
                                onValueChange={(value) => editFormik.setFieldValue('place_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("areas.selectPlace") || "Select a place"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {places?.map((place: Place) => (
                                        <SelectItem key={place.id} value={place.id.toString()}>
                                            {place.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editFormik.touched.place_id && editFormik.errors.place_id && (
                                <p className="text-sm text-red-500">{editFormik.errors.place_id}</p>
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
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='text-center'>{t("common.id")}</TableHead>
                            <TableHead className='text-center'>{t("areas.name")}</TableHead>
                            <TableHead className='text-center'>{t("areas.areaCode")}</TableHead>
                            <TableHead className='text-center'>{t("areas.price")}</TableHead>
                            <TableHead className='text-center'>{t("areas.place")}</TableHead>
                            <TableHead className='text-center'>{t("common.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : areas && areas.length > 0 ? (
                            areas.map((area: Area) => (
                                <TableRow key={area.id}>
                                    <TableCell className='text-center'>{area.id}</TableCell>
                                    <TableCell className='text-center'>{area.name}</TableCell>
                                    <TableCell className='text-center'>{area.area_code || '-'}</TableCell>
                                    <TableCell className='text-center'>{area.price.toFixed(2)}</TableCell>
                                    <TableCell className='text-center'>
                                        {area.place ? (
                                            <Badge variant="secondary">{area.place.name}</Badge>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(area)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(area.id)}
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
                                <TableCell colSpan={6} className="text-center">
                                    {t("areas.noAreas") || "No areas found"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}