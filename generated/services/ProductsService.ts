/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { active_products_example } from '../models/active_products_example';
import type { category_mappings_example } from '../models/category_mappings_example';
import type { named_products_example } from '../models/named_products_example';
import type { room_id } from '../models/room_id';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductsService {
    /**
     * Gets dictionary of named products
     * Returns a dictionary of all named products with their product ID. A named product is a shorthand associated with a product ID.
     * @returns named_products_example Dictionary of all named_product names.
     * @throws ApiError
     */
    public static dumpNamedProducts(): CancelablePromise<named_products_example> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/named_products',
        });
    }
    /**
     * Gets dictionary of products that are active
     * Dictionary of products, key is product ID, value is product name and product price.
     * @param roomId ID of the room to retrieve.
     * @returns active_products_example Dictionary of all activated products, with their name and price (in stregører).
     * @throws ApiError
     */
    public static dumpActiveProducts(
        roomId: room_id,
    ): CancelablePromise<active_products_example> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/active_products',
            query: {
                'room_id': roomId,
            },
            errors: {
                400: `Room does not exist, invalid room ID, or missing parameter.`,
            },
        });
    }
    /**
     * Gets a dictionary of products with categories
     * Dictionary of product IDs with category ID and category name as value.
     * @returns category_mappings_example Dictionary of all activated products, with their mapped categories (both category name and ID).
     * @throws ApiError
     */
    public static dumpCategoryMappings(): CancelablePromise<category_mappings_example> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/category_mappings',
        });
    }
}
