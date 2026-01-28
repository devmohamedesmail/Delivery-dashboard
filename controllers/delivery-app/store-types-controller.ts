import { config } from "@/constants/config";
import axios from "axios";
import Cookies from 'js-cookie';

interface StoreType {
    id: number;
    name_ar: string;
    name_en: string;
    description_ar?: string;
    description_en?: string;
    image?: string;
}

export default class StoreTypesController {
    /**
     * Get all store types
     */
    static async getStoreTypes(): Promise<StoreType[]> {
        try {
            const response = await axios.get(`${config.API_URL}/store-types`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get single store type by ID
     */
    static async getStoreTypeById(id: number): Promise<StoreType> {
        try {
            const response = await axios.get(`${config.API_URL}/store-types/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a new store type
     */
    static async createStoreType(formData: FormData): Promise<StoreType> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.post(
                `${config.API_URL}/store-types/create`,
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
     * Update an existing store type
     */
    static async updateStoreType(id: number, formData: FormData): Promise<StoreType> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.put(
                `${config.API_URL}/store-types/update/${id}`,
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
     * Delete a store type
     */
    static async deleteStoreType(id: number): Promise<void> {
        try {
            const token = Cookies.get('access_token');
            await axios.delete(`${config.API_URL}/store-types/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            throw error;
        }
    }
}

export type { StoreType };