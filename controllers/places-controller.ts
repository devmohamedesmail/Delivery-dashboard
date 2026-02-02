import { config } from "@/constants/config";
import axios from "axios";
import Cookies from 'js-cookie';

interface StoreType {
    id: number;
    name_ar: string;
    name_en: string;
    description?: string;
    image?: string;
}

interface PlaceStoreType {
    id: number;
    place_id: number;
    store_type_id: number;
    storeType: StoreType;
}

interface Place {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    storeTypes?: PlaceStoreType[];
}

interface CreatePlaceData {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    store_type_ids: number[];
}

interface UpdatePlaceData {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    store_type_ids?: number[];
}

export default class PlaceController {



    /**
     * Get all places
     * @returns 
     */
    static async getPlaces(): Promise<Place[]> {
        const res = await axios.get(`${config.API_URL}/places`);
        return res.data.data;
    }

    /**
     * Get all store types
     * @returns 
     */
    static async getStoreTypes(): Promise<StoreType[]> {
        const res = await axios.get(`${config.API_URL}/store-types`);
        return res.data.data;
    }

    /**
     * GET single place
     */
    static async getPlaceById(id: number): Promise<Place> {
        const res = await axios.get(`${config.API_URL}/places/${id}`);
        return res.data.data;
    }

    /**
     * CREATE place
     */
    static async createPlace(data: CreatePlaceData): Promise<Place> {
        const token = Cookies.get('access_token');
        const res = await axios.post(
            `${config.API_URL}/places/create`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return res.data.data;
    }

    /**
     * UPDATE place
     */
    static async updatePlace(id: number, data: UpdatePlaceData): Promise<Place> {
        const token = Cookies.get('access_token');
        const res = await axios.put(
            `${config.API_URL}/places/${id}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return res.data.data;
    }

    /**
     * DELETE place
     */
    static async deletePlace(id: number): Promise<void> {
        const token = Cookies.get('access_token');
        await axios.delete(`${config.API_URL}/places/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}

export type { Place, StoreType, PlaceStoreType, CreatePlaceData, UpdatePlaceData };