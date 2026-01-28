import { config } from "@/constants/config";
import axios from "axios";
import Cookies from 'js-cookie';

interface Store {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    logo?: string;
    banner?: string;
    start_time?: string;
    end_time?: string;
    devlivery_time?: number;
    rating?: number;
    is_active: boolean;
    is_verified: boolean;
    is_featured: boolean;
    user_id: number;
    store_type_id: number;
    place_id: number;
    createdAt?: string;
    updatedAt?: string;
    storeType?: {
        id: number;
        name_ar: string;
        name_en: string;
    };
    user?: {
        id: number;
        name?: string;
        email?: string;
    };
    place?: {
        id: number;
        name: string;
    };
}

export default class StoreController {
    /**
     * Get all stores
     */
    static async getStores(): Promise<Store[]> {
        try {
            const response = await axios.get(`${config.API_URL}/stores`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get single store by ID
     */
    static async getStoreById(id: number): Promise<Store> {
        try {
            const response = await axios.get(`${config.API_URL}/stores/show/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get stores by store type
     */
    static async getStoresByType(storeTypeId: number): Promise<Store[]> {
        try {
            const response = await axios.get(`${config.API_URL}/stores/type/${storeTypeId}`);
            return response.data.data.stores;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a new store
     */
    static async createStore(formData: FormData): Promise<Store> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.post(
                `${config.API_URL}/stores/create`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update an existing store
     */
    static async updateStore(id: number, formData: FormData): Promise<Store> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.put(
                `${config.API_URL}/stores/update/${id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a store
     */
    static async deleteStore(id: number): Promise<void> {
        try {
            const token = Cookies.get('access_token');
            await axios.delete(`${config.API_URL}/stores/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Toggle store active status
     */
    static async toggleStatus(id: number): Promise<{ is_active: boolean }> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.patch(
                `${config.API_URL}/stores/toggle-status/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify store
     */
    static async verifyStore(id: number): Promise<{ is_verified: boolean }> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.patch(
                `${config.API_URL}/stores/${id}/verify`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Toggle store featured status
     */
    static async toggleFeatured(id: number): Promise<{ is_featured: boolean }> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.patch(
                `${config.API_URL}/stores/${id}/featured`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
}

export type { Store };
