import {promise_cond} from "../util/async";
import config from "../../config";
import {AppDatabase, StoredToken} from "../database";
import {SaleResponse, ActiveProductList} from "./index";

const {base_api_url} = config;

const auth_header = async (): Promise<Record<string, string>> => {
    const token: StoredToken = await AppDatabase.instance.settings
        .get(AppDatabase.access_token_key);

    if (token == null || token.expires_at <= Date.now())
        return {};

    return {Authorization: `Bearer ${token.value}`};
};

export const api_fetch = async (url: string, init: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(init.headers);

    for (const [key, value] of Object.entries(await auth_header()))
        headers.set(key, value);

    return fetch(url, {...init, headers});
};

export const get_member_id = (username: string): Promise<number> =>
    api_fetch(`${base_api_url}/member/get_id?username=${username}`)
        .then(res => promise_cond(res.status === 200, res, "Invalid status code"))
        .then(res => res.json())
        .then(value => value['member_id']);

export const get_member_info = (user_id: number): Promise<any> =>
    api_fetch(`${base_api_url}/member?member_id=${user_id}`)
        .then(res => promise_cond(res.status === 200, res, res))
        .then(res => res.json());

export const get_member_balance = (user_id: number): Promise<number> =>
    api_fetch(`${base_api_url}/member/balance?member_id=${user_id}`)
        .then(res => promise_cond(res.status === 200, res, res))
        .then(res => res.json())
        .then(value => value['balance']);

export const get_active_products = (room_id: number): Promise<ActiveProductList> =>
    api_fetch(`${base_api_url}/products/active_products?room_id=${room_id}`)
        .then(res => promise_cond(res.status === 200, res, res))
        .then(res => res.json());

export const post_sale = (buystring: string, room: number, user_id: number): Promise<SaleResponse> =>
    api_fetch(`${base_api_url}/sale`, {
        method: 'POST',
        cache: "no-cache",
        headers: {
            "Content-Type": 'application/json',
        },
        body: JSON.stringify({buystring, room, member_id: `${user_id}`}),
    })
        .then(res => promise_cond(res.status === 200, res, res))
        .then(res => res.json());

export const init = () => Promise.resolve();
