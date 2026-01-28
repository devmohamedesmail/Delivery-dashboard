import { config } from "@/constants/config";
import axios from "axios";

export interface Category {
    id: number;
    title_en: string;
    title_ar: string;
    createdAt: string;
}
export default class CategoryController {

    // Get all categories
    static async getAll(): Promise<Category[]> {
        const { data } = await axios.get(`${config.FREELANCER_URL}/categories`);
        return data.data;
    }


    // Get single category
    static async getById(id: number): Promise<Category> {
        const { data } = await axios.get(`${config.FREELANCER_URL}/categories/${id}`);
        return data.data;
    }



    // Create category
    static async create(payload: {
        title_en: string;
        title_ar: string;
    }): Promise<Category> {
        const { data } = await axios.post(`${config.FREELANCER_URL}/categories/create`, payload);
        return data.data;
    }



    static async update(
        id: number,
        payload: { title_en: string; title_ar: string }
    ): Promise<Category> {
        const { data } = await axios.put(`${config.FREELANCER_URL}/categories/${id}`, payload);
        return data.data;
    }

    // Delete category
    static async delete(id: number): Promise<void> {
        await axios.delete(`${config.FREELANCER_URL}/categories/${id}`);
    }
}