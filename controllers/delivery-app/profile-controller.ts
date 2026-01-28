import { config } from "@/constants/config";
import axios from "axios";
import Cookies from 'js-cookie';

interface ProfileUpdateData {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: File;
}

interface Role {
    id: number;
    role: string;
    title_ar?: string;
    title_en?: string;
}

interface Store {
    id: number;
    name: string;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    role: Role;
    store?: Store;
}

export default class ProfileController {
    /**
     * Get user profile
     */
    static async getProfile(): Promise<UserProfile> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.get(
                `${config.API_URL}/auth/get-profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data.user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
        try {
            const token = Cookies.get('access_token');
            const formData = new FormData();

            if (data.name) formData.append('name', data.name);
            if (data.email) formData.append('email', data.email);
            if (data.phone) formData.append('phone', data.phone);
            if (data.avatar) formData.append('avatar', data.avatar);

            const response = await axios.put(
                `${config.API_URL}/auth/update-profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data.user;
        } catch (error) {
            throw error;
        }
    }
}

export type { ProfileUpdateData, Role, Store };
