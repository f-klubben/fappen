import {ActiveProductList, SaleResponse} from "./index";
import {loadPyodide} from "pyodide";

const sts_source = "https://raw.githubusercontent.com/f-klubben/stregsystemet-cli/master/main.py";

const init = async () => {
    const pyodide = await loadPyodide();
    pyodide.runPython(`
    import micropip
    await micropip.install('pyodide-http')
    
    import pyodide_http
    pyodide_http.patch_all()
    
    `)
};

export const get_user_id = (username: string): Promise<number> =>
    Promise.resolve(1);

export const get_user_info = (user_id: number): Promise<any> =>
    Promise.resolve();

export const get_user_balance = (user_id: number): Promise<number> =>
    Promise.resolve(1);

export const get_active_products = (room_id: number): Promise<ActiveProductList> =>
    Promise.resolve({});

export const post_sale = (buystring: string, room: number, user_id: number): Promise<SaleResponse> =>
    Promise.resolve(<SaleResponse>{});
