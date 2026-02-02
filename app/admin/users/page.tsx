'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UserController from '@/controllers/users-controller';
import type { User } from '@/controllers/users-controller';
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, Store as StoreIcon, CheckCircle, XCircle } from "lucide-react";
import toast from 'react-hot-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function UsersPage() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("");

    /* ================= FETCH USERS ================= */
    const { data: users, isLoading } = useQuery({
        queryKey: ["users", roleFilter, searchTerm],
        queryFn: () => UserController.getUsers({
            role_id: roleFilter ? Number(roleFilter) : undefined,
            search: searchTerm || undefined
        }),
    });
   



    console.log("Fetched users:", users);
    /* ================= FETCH STATISTICS ================= */
    const { data: statistics } = useQuery({
        queryKey: ["userStatistics"],
        queryFn: UserController.getStatistics,
    });

    /* ================= DELETE MUTATION ================= */
    const deleteMutation = useMutation({
        mutationFn: UserController.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["userStatistics"] });
            toast.success("User deleted successfully!");
        },
        onError: (error: any) => {
            console.log("Delete error:", error);
            toast.error(error?.response?.data?.message || "Failed to delete user");
        },
    });

    /* ================= HANDLERS ================= */
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            deleteMutation.mutate(id);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'store_owner':
                return 'bg-blue-100 text-blue-800';
            case 'driver':
                return 'bg-green-100 text-green-800';
            case 'user':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Users Management</h1>
            </div>

            {/* STATISTICS CARDS */}
            {/* {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_users}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.users_by_role?.admin || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Store Owners</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.users_by_role?.store_owner || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Users with Store</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.users_with_store}</div>
                        </CardContent>
                    </Card>
                </div>
            )} */}

            {/* FILTERS */}
            {/* <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Roles</SelectItem>
                        <SelectItem value="1">Admin</SelectItem>
                        <SelectItem value="2">User</SelectItem>
                        <SelectItem value="3">Store Owner</SelectItem>
                        <SelectItem value="4">Driver</SelectItem>
                    </SelectContent>
                </Select>
            </div> */}

            {/* TABLE */}
            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email Verified</TableHead>
                            <TableHead>Phone Verified</TableHead>
                            <TableHead>Has Store</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : users && users.length > 0 ? (
                            users.map((user: User) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell className="font-medium">{user.name || '-'}</TableCell>
                                    <TableCell>{user.email || '-'}</TableCell>
                                    <TableCell>{user.phone || '-'}</TableCell>
                                    <TableCell>
                                        {user.role && (
                                            <Badge className={getRoleBadgeColor(user.role.role)}>
                                                {user.role.role}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.email_verified ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.phone_verified ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.store ? (
                                            <div className="flex items-center gap-2">
                                                <StoreIcon className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">{user.store.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
