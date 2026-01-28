import { config } from "@/constants/config";
import axios from "axios";

export interface Subcategory {
    id: number;
    title_en: string;
    title_ar: string;
    category_id: number;
    category?: {
        id: number;
        title_en: string;
        title_ar: string;
    };
    createdAt: string;
}
export default class SubCategoryController {
    // Get all subcategories
    static async getAll(): Promise<Subcategory[]> {
        const { data } = await axios.get(`${config.FREELANCER_URL}/subcategories`);
        return data.data;
    }

    // Get single subcategory
    static async getById(id: number): Promise<Subcategory> {
        const { data } = await axios.get(`${config.FREELANCER_URL}/subcategories/${id}`);
        return data.data;
    }

    // Create subcategory
    static async create(payload: {
        title_en: string;
        title_ar: string;
        category_id: number;
    }): Promise<Subcategory> {
        const { data } = await axios.post(
            `${config.FREELANCER_URL}/subcategories/create`,
            payload
        );
        return data.data;
    }

    // Update subcategory
    static async update(
        id: number,
        payload: {
            title_en: string;
            title_ar: string;
            category_id: number;
        }
    ): Promise<Subcategory> {
        const { data } = await axios.put(
            `${config.FREELANCER_URL}/subcategories/${id}`,
            payload
        );
        return data.data;
    }

    // Delete subcategory
    static async delete(id: number): Promise<void> {
        await axios.delete(`${config.FREELANCER_URL}/subcategories/${id}`);
    }
}