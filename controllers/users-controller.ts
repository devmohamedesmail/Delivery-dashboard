import { config } from "@/constants/config";
import axios from "axios";
import Cookies from 'js-cookie';

interface Role {
    id: number;
    role: string;
    title_ar?: string;
    title_en?: string;
}

interface User {
    id: number;
    email?: string;
    phone?: string;
    name?: string;
    avatar?: string;
    email_verified: boolean;
    phone_verified: boolean;
    role_id: number;
    createdAt?: string;
    updatedAt?: string;
    role?: Role;
    store?: {
        id: number;
        name: string;
    };
}

interface UserStatistics {
    total_users: number;
    users_by_role: Record<string, number>;
    users_with_store: number;
}

export default class UserController {
    /**
     * Get all users
     */
    static async getUsers(params?: { role_id?: number; search?: string }): Promise<User[]> {
        try {
            const token = Cookies.get('access_token');
            const queryParams = new URLSearchParams();
            if (params?.role_id) queryParams.append('role_id', params.role_id.toString());
            if (params?.search) queryParams.append('search', params.search);

            const response = await axios.get(
                `${config.API_URL}/users?${queryParams.toString()}`,
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
     * Get single user by ID
     */
    static async getUserById(id: number): Promise<User> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.get(`${config.API_URL}/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get users by role name
     */
    static async getUsersByRole(roleName: string): Promise<User[]> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.get(`${config.API_URL}/users/role/${roleName}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    static async getStatistics(): Promise<UserStatistics> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.get(`${config.API_URL}/users/statistics`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a user
     */
    static async deleteUser(id: number): Promise<void> {
        try {
            const token = Cookies.get('access_token');
            await axios.delete(`${config.API_URL}/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user profile
     */
    static async getUserProfile(id: number): Promise<User> {
        try {
            const response = await axios.get(`${config.API_URL}/users/profile/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
}

export type { User, Role, UserStatistics };
