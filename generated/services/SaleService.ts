/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { sale_input } from '../models/sale_input';
import type { sale_values_result_example } from '../models/sale_values_result_example';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SaleService {
    /**
     * Posts a sale using a buy-string
     * Performs a sale by a buy-string, room and member id, then returns info regarding the purchase.
     * @param requestBody
     * @returns any An object containing various statistics and info regarding the purchase.
     * @throws ApiError
     */
    public static sale(
        requestBody: sale_input,
    ): CancelablePromise<{
        status?: number;
        msg?: string;
        values?: sale_values_result_example;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sale',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Room or member does not exist, invalid room or member ID, or missing parameter.`,
            },
        });
    }
}
