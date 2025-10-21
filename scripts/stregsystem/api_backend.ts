import {promise_cond} from "../util/async";
import config from "../../config";
import {SaleResponse, ActiveProductList, Sale} from "./index";

const {base_api_url} = config;

export const get_member_id = (username: string): Promise<number> =>
    fetch(`${base_api_url}/member/get_id?username=${username}`)
        .then(res => promise_cond(res.status === 200, res, "Invalid status code"))
        .then(res => res.json())
        .then(value => value['member_id']);

export const get_member_info = (user_id: number): Promise<any> =>
    fetch(`${base_api_url}/member?member_id=${user_id}`)
        .then(res => promise_cond(res.status === 200, res, res))
        .then(res => res.json());

export const get_member_balance = (user_id: number): Promise<number> =>
    fetch(`${base_api_url}/member/balance?member_id=${user_id}`)
        .then(res => promise_cond(res.status === 200, res, res))
        .then(res => res.json())
        .then(value => value['balance']);

export const get_active_products = (room_id: number): Promise<ActiveProductList> =>
    fetch(`${base_api_url}/products/active_products?room_id=${room_id}`)
        .then(res => promise_cond(res.status === 200, res, res))
        .then(res => res.json());

export const get_member_sales = (user_id: number): Promise<[Sale]> =>
    fetch(`${base_api_url}/member/sales?member_id=${user_id}`)
        .then(res => promise_cond(res.status === 200, res, res))
        .then(res => res.json());

export const post_sale = (buystring: string, room: number, user_id: number): Promise<SaleResponse> =>
    fetch(`${base_api_url}/sale`, {
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
