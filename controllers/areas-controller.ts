import { config } from "@/constants/config";
import axios from "axios";
import Cookies from 'js-cookie';

interface Area {
    id: number;
    name: string;
    area_code?: string;
    description?: string;
    price: number;
    place_id: number;
    createdAt?: string;
    updatedAt?: string;
    place?: {
        id: number;
        name: string;
        address: string;
    };
}

interface CreateAreaData {
    name: string;
    area_code?: string;
    description?: string;
    price: number;
    place_id: number;
}

interface UpdateAreaData {
    name?: string;
    area_code?: string;
    description?: string;
    price?: number;
    place_id?: number;
}

export default class AreaController {
    /**
     * Get all areas
     */
    static async getAreas(): Promise<Area[]> {
        try {
            const response = await axios.get(`${config.API_URL}/areas`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get single area by ID
     */
    static async getAreaById(id: number): Promise<Area> {
        try {
            const response = await axios.get(`${config.API_URL}/areas/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get areas by place ID
     */
    static async getAreasByPlaceId(placeId: number): Promise<Area[]> {
        try {
            const response = await axios.get(`${config.API_URL}/areas/place/${placeId}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a new area
     */
    static async createArea(data: CreateAreaData): Promise<Area> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.post(
                `${config.API_URL}/areas/create`,
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

    /**
     * Update an existing area
     */
    static async updateArea(id: number, data: UpdateAreaData): Promise<Area> {
        try {
            const token = Cookies.get('access_token');
            const response = await axios.put(
                `${config.API_URL}/areas/${id}`,
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

    /**
     * Delete an area
     */
    static async deleteArea(id: number): Promise<void> {
        try {
            const token = Cookies.get('access_token');
            await axios.delete(`${config.API_URL}/areas/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            throw error;
        }
    }
}

export type { Area, CreateAreaData, UpdateAreaData };
