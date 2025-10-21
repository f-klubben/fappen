import {ActiveProductList, SaleResponse} from "./index";
import * as py from "../util/python_interop";
import sts_py from 'bundle-text:sts.py';
import compat_py from 'bundle-text:./cli_compat.py';
import config from "../../config";

const html_decoder = document.createElement('span');

/**
 * Decodes an HTML escaped string by inserting it into an HTML element
 * and reading back its inner text.
 * @param src
 */
const decode_html_escapes = (src: string): string => {
    html_decoder.innerHTML = src;
    return html_decoder.innerText;
}

export const get_member_id = (username: string): Promise<number> => {
    username = JSON.stringify(username);
    return py.run(`
    if user_mgr.user.username != ${username}:
        user_mgr.set_user(${username}, req_handler)
    else:
        user_mgr.update_user(req_handler)
    user_mgr.get_user_id()
    `);
};

const reg_username = /<td>Brugernavn<\/td>\s*<td>(.+)<\/td>/;
const reg_firstname = /<td>Fornavn\(e\)<\/td>\s*<td>(.+)<\/td>/;
const reg_lastname = /<td>Efternavn<\/td>\s*<td>(.+)<\/td>/;
const reg_balance = /Du har ([0-9.]+) kroner til gode!/;
// sts-cli does not implement a way to get a user from its id
export const get_member_info = (user_id: number): Promise<any> =>
    fetch(`${config.base_api_url}/../${config.default_room}/user/${user_id}`)
        .if(res => res.status === 200, async res => {
            const response_text = await res.text();
            return {
                username: decode_html_escapes(reg_username.exec(response_text)[1]),
                name: [
                    decode_html_escapes(reg_firstname.exec(response_text)[1]),
                    decode_html_escapes(reg_lastname.exec(response_text)[1]),
                ].join(' '),
                balance: parseFloat(reg_balance.exec(response_text)[1]) * 100,
                active: true,
            };
        })
        .else_then_promise(() => Promise.reject("Unable to get user info."))

export const get_member_balance = (user_id: number): Promise<number> =>
    py.run(`
    if user_mgr.user.user_id != ${user_id}:
        user_mgr.user = await user_from_id(${user_id})
    else:
        user_mgr.update_balance(req_handler)
    user_mgr.get_balance() * 100
    `);


export const get_active_products = async (room_id: number): Promise<ActiveProductList> => {
    const py_products = await py.run(`
    sts.update_products()
    [clean_product(p.__dict__) for (_, p) in sts.products.items()]
    `);

    const products = {};
    for (const {id, name, price} of py_products) {
        products[id] = [name, price * 100];
    }

    return products;
};

export const post_sale = async (buystring: string, _: number, user_id: number): Promise<SaleResponse> => {
    const products = Object.fromEntries(
        buystring
            .split(' ')
            .slice(1)
            .map(x => x.split(':'))
            .map(([a, b]) => [a, parseInt(b) || 1])
    );

    const [status, msg] = await py.run(`
    if user_mgr.user.user_id != ${user_id}:
        user_mgr.user = await user_from_id(${user_id})
    to_js(sts.make_purchase(${JSON.stringify(products)}))
    `);

    return {status, msg};
}

@py.pyModule("cli_helper")
class CliHelper {

    @py.pyFn()
    static async user_from_id(id: number) {
        const {username, balance} = await get_member_info(id);
        return {username, balance, user_id: id};
    }

}

export const init = async () => {
    await py.init();

    await py.install('requests');
    await py.install_js_module(<py.PyModule & typeof CliHelper> CliHelper);

    await py.run(`
    force_disable_main = True
    _print = print # sts replaces print so we need keep a reference for later
    `)
    await py.run(sts_py);
    await py.run(compat_py);

    await py.run(`
    startup(
        '${config.base_api_url.substring(0, config.base_api_url.length-4)}',
        '${config.default_room}',
        )
    `);
};