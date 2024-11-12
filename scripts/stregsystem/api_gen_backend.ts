import {promise_cond} from "../util/async";
import config from "../../config";
import {SaleResponse, ActiveProductList} from "./index";
import {MemberService, ProductsService} from "../../generated";

const {base_api_url} = config;

export const get_member_id = (username: string): Promise<number> =>
    MemberService.getMemberId(username)
        .then(value => value.member_id);

export const get_member_info = (member_id: number): Promise<any> =>
    MemberService.getMemberInfo(member_id)
        .then();

export const get_member_balance = (member_id: number): Promise<number> =>
    MemberService.getMemberBalance(member_id)
        .then(value => value.balance);

export const get_active_products = (room_id: number): Promise<ActiveProductList> =>
    ProductsService.dumpActiveProducts(room_id)
        .then();

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
