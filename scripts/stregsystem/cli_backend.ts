import {ActiveProductList, SaleResponse} from "./index";
import * as py from "../util/python_interop";
import sts_url from 'url:sts-py'; // sts-py is an alias defined in /package.json
import test from 'url:test';

export const get_user_id = (username: string): Promise<number> =>
    py.run(`
    print('we in get_user_id')
    print(user_mgr)
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

export const init = async () => {
    await py.init();

    await py.load_file('pyodide_http-0.2.0-py3-none-any.whl', test);
    await py.install('emfs:/pyodide_http-0.2.0-py3-none-any.whl')

    //await patch_http();

    await py.load_file('sts-0.0.3-py3-none-any.whl', sts_url);
    await py.install("emfs:/sts-0.0.3-py3-none-any.whl");

    await py.run(`
    print("pre import")
    from sts import Configuration, pre_parse, Stregsystem
    print("pre argparse")
    import argparse
    
    print("imports complete")
    
    config = Configuration()
    args = [ '-z' ] # Flag for disabling plugin loader
    _parser = argparse.ArgumentParser(add_help=False)
    _args = pre_parse(arg_array, _parser)
    
    sts = Stregsytem(config, _args, args)
    
    req_handler = sts._request_handler
    user_mgr = sts._user_manager
    print('we in?')
    print(user_mgr)
    `);

    // TODO remove this (its for testing)
    console.log(`get user`)
    const user_id = await get_user_id('tester');
    console.log(user_id);
};