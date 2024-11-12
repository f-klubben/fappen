/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { bp_minutes } from './bp_minutes';
import type { bp_seconds } from './bp_seconds';
import type { caffeine } from './caffeine';
import type { created_on } from './created_on';
import type { cups } from './cups';
import type { give_multibuy_hint } from './give_multibuy_hint';
import type { is_ballmer_peaking } from './is_ballmer_peaking';
import type { is_coffee_master } from './is_coffee_master';
import type { member_has_low_balance } from './member_has_low_balance';
import type { member_id } from './member_id';
import type { product_contains_caffeine } from './product_contains_caffeine';
import type { product_id } from './product_id';
import type { promille } from './promille';
import type { room_id } from './room_id';
import type { sale_hints } from './sale_hints';
import type { stregoere_balance } from './stregoere_balance';
import type { stregoere_price } from './stregoere_price';
export type sale_values_result_example = {
    order?: {
        room?: room_id;
        member?: member_id;
        created_on?: created_on;
        items?: Array<product_id>;
    };
    promille?: promille;
    is_ballmer_peaking?: is_ballmer_peaking;
    bp_minutes?: bp_minutes;
    bp_seconds?: bp_seconds;
    caffeine?: caffeine;
    cups?: cups;
    product_contains_caffeine?: product_contains_caffeine;
    is_coffee_master?: is_coffee_master;
    cost?: stregoere_price;
    give_multibuy_hint?: give_multibuy_hint;
    sale_hints?: sale_hints;
    member_has_low_balance?: member_has_low_balance;
    member_balance?: stregoere_balance;
};

