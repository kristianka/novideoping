export interface DataResponse {
    success: boolean;
    map: unknown;
    listMap: [
        {
            is_active: boolean;
            product_url: string;
            price: string;
            fe_sku: string;
            locale: string;
        }
    ];
}
