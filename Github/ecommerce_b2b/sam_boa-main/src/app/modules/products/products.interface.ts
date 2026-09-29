export type TProductFilterRequest = {
    searchTerm?: string;
    category?: string;
    size?: string;
    brand?: string;
    priceRange?: string;
    productType?: string;
    condition?: string;
    color?: string;
    area?: string;
    minPrice?: number;
    maxPrice?: number;
    interest?: string;
};