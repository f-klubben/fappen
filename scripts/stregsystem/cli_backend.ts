import {ActiveProductList, SaleResponse} from "./index";
import * as py from "../util/python_interop";
import sts_py from 'bundle-text:sts.py';
import config from "../../config";

export const get_user_id = (username: string): Promise<number> =>
    py.run(`
    if user_mgr.user.username != '${username}':
        user_mgr.set_user('${username}', req_handler)
    else:
        user_mgr.update_user(req_handler)
    user_mgr.get_user_id()
    `);

export const get_user_info = (user_id: number): Promise<any> =>
    Promise.resolve();

export const get_user_balance = (user_id: number): Promise<number> =>
    Promise.resolve(1);

export const get_active_products = (room_id: number): Promise<ActiveProductList> =>
    Promise.resolve({});

export const post_sale = (buystring: string, room: number, user_id: number): Promise<SaleResponse> =>
    Promise.resolve(<SaleResponse>{});

@py.pyModule("cookie_helper")
class CookieHelper {

    @py.pyFn()
    static set_cookies(cookies: object) {
        for (let key in cookies) {
            document.cookie = `${key}=${cookies[key]};domain=localhost;samesite=none;secure`;
        }
    }

}

export const init = async () => {
    await py.init();

    await py.patch_http();
    await py.install_js_module(<py.PyModule & typeof CookieHelper> CookieHelper);

    await py.run('force_disable_main = True')
    await py.run(sts_py);

    await py.run(`
    import argparse
    
    CONSTANTS['url'] = '${config.base_api_url.substring(0, config.base_api_url.length-4)}'
    CONSTANTS['room'] = ${config.default_room}
    
    # Inject cookie handler
    # original_set_cookies = Stregsystem.RequestHandler.set_cookies
    # def set_cookies(self):
    #    import cookie_helper
    #    original_set_cookies(self)
    #    cookie_helper.set_cookies(self.cookies)
    
    # Stregsystem.RequestHandler.set_cookies = set_cookies
    
    from js import XMLHttpRequest
    xhr_new = XMLHttpRequest.new
    def new_request():
        req = xhr_new();
        print(req)
        print(req.withCredentials)
        req.withCredentials = True
        return req
        
    XMLHttpRequest.new = new_request()
    
    # Resume normal startup
    
    config = Configuration()
    args = [ '-z' ] # Flag for disabling plugin loader
    _parser = argparse.ArgumentParser(add_help=False)
    _args = pre_parse(args, _parser)
    
    sts = Stregsystem(config, _args, args)
    
    req_handler = sts._request_handler
    user_mgr = sts._user_manager
    `);

    // TODO remove this (its for testing)
    console.log(`get user`)
    const user_id = await get_user_id('tester');
    console.log(user_id);
};