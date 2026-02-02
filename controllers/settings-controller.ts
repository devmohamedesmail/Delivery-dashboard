import { config } from "@/constants/config";
import axios from "axios";
import Cookies from 'js-cookie';

export interface Setting {
    id: number;
    name_ar: string;
    name_en: string;
    logo?: string;
    banner?: string;
    version: string;
    description: string;
    url: string;
    email: string;
    phone: string;
    address: string;
    facebook: string;
    instagram: string;
    twitter: string;
    whatsapp: string;
    telegram: string;
    support_phone?: string;
    support_chat?: string;
    support_email?: string;
    support_address?: string;
    support_hours?: string;
    support_whatsapp?: string;
    maintenance_mode: boolean;
    maintenance_message?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateSettingDto {
    name_ar?: string;
    name_en?: string;
    version?: string;
    description?: string;
    url?: string;
    email?: string;
    phone?: string;
    address?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
    telegram?: string;
    support_phone?: string;
    support_chat?: string;
    support_email?: string;
    support_address?: string;
    support_hours?: string;
    support_whatsapp?: string;
    maintenance_mode?: boolean;
    maintenance_message?: string;
    logo?: File;
    banner?: File;
}

export default class SettingsController {
    /**
     * Get the first setting (main application settings)
     */
    static async getSetting(): Promise<Setting> {
        try {
            const response = await axios.get(`${config.API_URL}/settings`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a new setting
     */
    static async createSetting(formData: FormData): Promise<Setting> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.post(
                `${config.API_URL}/settings/create`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update a setting
     */
    static async updateSetting(id: number, formData: FormData): Promise<Setting> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.put(
                `${config.API_URL}/settings/update/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Toggle maintenance mode
     */
    static async toggleMaintenance(id: number, data: { maintenance_mode: boolean; maintenance_message?: string }): Promise<Setting> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.patch(
                `${config.API_URL}/settings/maintenance/${id}`,
                data,
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
