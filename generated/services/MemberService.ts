/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { active } from '../models/active';
import type { balance } from '../models/balance';
import type { member_id } from '../models/member_id';
import type { MemberInfo } from '../models/MemberInfo';
import type { sales } from '../models/sales';
import type { stregoere_balance } from '../models/stregoere_balance';
import type { username } from '../models/username';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MemberService {
    /**
     * Get member info
     * Gets a member's balance, username, active-status and name.
     * @param memberId ID of the member to retrieve.
     * @returns MemberInfo Member found.
     * @throws ApiError
     */
    public static getMemberInfo(
        memberId: member_id,
    ): CancelablePromise<MemberInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/member',
            query: {
                'member_id': memberId,
            },
            errors: {
                400: `Member does not exist, invalid member ID, or missing parameter.`,
            },
        });
    }
    /**
     * Get member balance
     * Gets a member's balance.
     * @param memberId ID of the member to retrieve.
     * @returns any Member found.
     * @throws ApiError
     */
    public static getMemberBalance(
        memberId: member_id,
    ): CancelablePromise<{
        balance?: balance;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/member/balance',
            query: {
                'member_id': memberId,
            },
            errors: {
                400: `Member does not exist, invalid member ID, or missing parameter.`,
            },
        });
    }
    /**
     * Get member active-status
     * Gets whether a member is active.
     * @param memberId ID of the member to retrieve.
     * @returns any Member found.
     * @throws ApiError
     */
    public static getMemberActive(
        memberId: member_id,
    ): CancelablePromise<{
        active?: active;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/member/active',
            query: {
                'member_id': memberId,
            },
            errors: {
                400: `Member does not exist, invalid member ID, or missing parameter.`,
            },
        });
    }
    /**
     * Get member sales
     * Gets a list of a member's purchases.
     * @param memberId ID of the member to retrieve.
     * @returns any Member found.
     * @throws ApiError
     */
    public static getMemberSales(
        memberId: member_id,
    ): CancelablePromise<{
        sales?: sales;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/member/sales',
            query: {
                'member_id': memberId,
            },
            errors: {
                400: `Member does not exist, invalid member ID, or missing parameter.`,
            },
        });
    }
    /**
     * Get member ID
     * Gets a member's ID from their username.
     * @param username Username of the member.
     * @returns any Member found.
     * @throws ApiError
     */
    public static getMemberId(
        username: username,
    ): CancelablePromise<{
        member_id?: member_id;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/member/get_id',
            query: {
                'username': username,
            },
            errors: {
                400: `Member does not exist, or missing parameter.`,
            },
        });
    }
    /**
     * Get payment QR code
     * Returns a QR code for payment for a member.
     * @param username Username of the member.
     * @param amount Amount of money in streg-oere.
     * @returns string QR code with link to open MobilePay with the provided information.
     * @throws ApiError
     */
    public static getPaymentQr(
        username: username,
        amount?: stregoere_balance,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/member/payment/qr',
            query: {
                'username': username,
                'amount': amount,
            },
            errors: {
                400: `Invalid input has been provided.`,
            },
        });
    }
}
