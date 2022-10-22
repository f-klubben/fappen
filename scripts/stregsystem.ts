import {promise_cond} from "./util/async";
import config from "../config"

const {base_api_url} = config;

export interface UserProfile {
    username: string,
    id: number,
    active: boolean,
    name: string,
    balance: number,
}

interface SaleResponse {
    status: string,
    msg: string,
    values: {
        order: {
            room: number,
            member: number, // string?
            create_on: string,
            items: string,
        },
        promille: number,
        is_ballmer_peaking: boolean
        bp_minutes: number,
        bp_seconds: number,
        caffeine: number,
        cups: number,
        product_contains_caffeine: boolean,
        is_coffee_master: boolean,
        cost: number,
        give_multibuy_hint: boolean,
        sale_hints: boolean
    }
}

/*
    API Calls
 */

/**
 * Gets the id that corresponds to a given username.
 * @param username
 */
const get_user_id = (username: string): Promise<number> =>
    fetch(`${base_api_url}/member/get_id?username=${username}`)
        .then(res => promise_cond(res.status === 200, res, "Invalid status code"))
        .then(res => res.json())
        .then(value => value['member_id']);

/**
 * Gets the user information associated with the given user id.
 * @param user_id
 */
const get_user_info = (user_id: number): Promise<any> =>
    fetch(`${base_api_url}/member?member_id=${user_id}`)
        .then(res => promise_cond(res.status === 200, res, res.text()))
        .then(res => res.json());

/**
 * Get the current balance of the given user by id.
 * @param user_id
 */
const get_user_balance = (user_id: number): Promise<number> =>
    fetch(`${base_api_url}/member/balance?member_id=${user_id}`)
        .then(res => promise_cond(res.status === 200, res, res.text()))
        .then(res => res.json())
        .then(value => value['balance']);

/**
 * Performs a sale request.
 * @param buystring A string describing the products that are to be purchased.
 * @param room
 * @param user_id
 */
const post_sale = (buystring: string, room: number, user_id: number): Promise<SaleResponse> =>
    fetch(`${base_api_url}/sale`, {
        method: 'POST',
        cache: "no-cache",
        headers: {
            "Content-Type": 'application/json'
        },

        body: JSON.stringify({buy_string: buystring, room, member_id: user_id})
    })
        .then(res => promise_cond(res.status === 200, res, res.text()))
        .then(res => res.json());


/*
    Public interface
 */

/**
 * Check whether the stregsystem can be reached.
 */
export const check_access = async (): Promise<boolean> => (await fetch(base_api_url)).status === 200;

/**
 * Fetches a user profile by username.
 * @param username
 */
export const fetch_profile = async (username: string): Promise<UserProfile> => {
    let user_id = await get_user_id(username);
    let {name, active, balance} = await get_user_info(user_id);

    return {
        username, id: user_id,
        name, active, balance,
    };
}

export const purchase = async (profile: UserProfile, product_id: number) => null;

export const save_profile = async (profile: UserProfile) => null;

export const load_profile = async (): Promise<UserProfile> => null;