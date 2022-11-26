import {AppEvent} from "../util/async";
import config from "../../config";

const {base_api_url, default_room, features} = config;

import * as cli_backend from './cli_backend';
import * as api_backend from './api_backend';

import access_failure_msg from 'bundle-text:../../components/stregsystem/access_failure.pug';
import access_no_api from 'bundle-text:../../components/stregsystem/access_no_api.pug';
import {
    as_tuples,
    disable_loading_indicator,
    enable_loading_indicator,
    pointer_events,
    reduce_sum, text, void_promise,
} from "../util/common";
import {AppDatabase} from "../database";

export interface UserProfile {
    username: string,
    id: number,
    active: boolean,
    name: string,
    balance: number,
}

export interface SaleResponse {
    status: string,
    msg: string,
    values?: {
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
        sale_hints: boolean,
    }
}

export interface ActiveProductList {
    [product_id: string]: [
        string, // Product name
        number, // Price
    ]
}

type BalanceChange = { old_balance: number, new_balance: number };

/**
 * The backend interface generalises over the basic functionality
 * that is required for the stregsystem to function.
 * This is done to allow for interchangeable use of stregsystem API based
 * implementation and the stregsystem-cli based implementation.
 */
export interface Backend {
    /**
     * Gets the id that corresponds to a given username.
     * @param username
     */
    get_user_id(username: string): Promise<number>;

    /**
     * Gets the user information associated with the given user id.
     * @param user_id
     */
    get_user_info(user_id: number): Promise<any>;

    /**
     * Get the current balance of the given user by id.
     * @param user_id
     */
    get_user_balance(user_id: number): Promise<number>;

    /**
     * Get a list of products that are active within a given room.
     * @param room_id
     */
    get_active_products(room_id: number): Promise<ActiveProductList>;

    /**
     * Performs a sale request.
     * @param buystring A string describing the products that are to be purchased,
     *                  as well as the name of user performing the purchase.
     * @param room_id
     * @param user_id
     */
    post_sale(buystring: string, room_id: number, user_id: number);

    init(): Promise<void>;
}

/**
 * The active backed
 */
const backend: Backend = features.cli_backend ? cli_backend : api_backend;

/*
    Public interface
 */

export enum AccessStatus {
    StregsystemUnavailable = 0,
    StregsystemAvailable,
    ApiAvailable,
}

/**
 * Check whether the stregsystem can be reached.
 */
export const check_access = (): Promise<AccessStatus> =>
    fetch(`${base_api_url}/..`)
        .if(res => res.status === 200, AccessStatus.StregsystemAvailable)
        .then_if_async(state => fetch(`${base_api_url}/products/active_products?room_id=${default_room}`)
            .if(res => res.status === 200, AccessStatus.ApiAvailable)
            .else_use(state))
        .else_promise(AccessStatus.StregsystemUnavailable)
        .catch(err => {
            console.log("Stregsystem access check failed.");
            console.log(err);
            return AccessStatus.StregsystemUnavailable;
        });

/**
 * Fetches a user profile by username.
 * @param username
 */
export const fetch_profile = async (username: string): Promise<UserProfile> => {
    const user_id = await backend.get_user_id(username);
    const {name, active, balance} = await backend.get_user_info(user_id);

    return {
        username, id: user_id,
        name, active, balance,
    };
};

/*
    UI / HTML Elements
 */

const load_saved_profile = (): Promise<UserProfile> => AppDatabase.instance.settings
    .get(AppDatabase.active_profile_key)
    .then(profile => {
        if (profile == null)
            return Promise.reject(`Key \`${AppDatabase.active_profile_key}\` not found.`);
        events.profile_loaded.dispatch(profile);
        return profile;
    });

export const events = {
    ready: new AppEvent<null>("stregsystem_ready"),
    access_update: new AppEvent<AccessStatus>("access_status"),
    profile_loaded: new AppEvent<UserProfile>("profile_loaded"),
    profile_balance_change: new AppEvent<BalanceChange>("profile_balance_change"),
};

/**
 * Formats a stregdollar price value as `XX.XX kr`
 * @param value
 */
const format_stregdollar = (value: number): string => `${(value / 100).toFixed(2)} kr`;

type CartDialogResponse = "" | "confirm";

/**
 * Custom HTML element class for element `<fa-streg-product>`.
 * Represents a stregsystem product.
 */
class FaStregProduct extends HTMLElement {
    target_cart: FaStregCart;
    decrement_btn: HTMLButtonElement;

    product_id: number;
    price: number;
    name: string;

    constructor(target: FaStregCart, product_id: number, name: string, price: number) {
        super();

        this.target_cart = target;

        this.product_id = product_id;
        this.price = price;
        this.name = name;

        this.innerHTML = `${name}<span>${format_stregdollar(price)} <button class="dec">-</button></span>`;

        this.decrement_btn = this.querySelector('.dec') as HTMLButtonElement;
        this.decrement_btn.style.display = 'none';

        pointer_events(this.decrement_btn, {
            n_click: this.removeFromCart.bind(this),
            stop_propagation: true,
        });

        pointer_events(this, {
            click: this.addToCart.bind(this),
            hold: [800, this.purchaseSingle.bind(this)],
        });
    }

    async purchaseSingle() {
        if (confirm(`Do you want to purchase 1 x ${this.name} for ${format_stregdollar(this.price)}`)) {
            const {profile} = this.target_cart.owner;
            if (profile.balance < this.price) {
                alert("You cannot afford this purchase. It will be cancelled.");
                return;
            }

            enable_loading_indicator(true);
            try {
                await backend.post_sale(`${profile.username} ${this.product_id}`, default_room, profile.id);
                const new_balance = await backend.get_user_balance(profile.id);
                events.profile_balance_change.dispatch({old_balance: profile.balance, new_balance});
            } catch (err) {
                alert("Purchase failed.");
                console.error(err);
            } finally {
                disable_loading_indicator();
            }

        }
    }

    removeFromCart(_, bounces: number) {
        const cart_contents = this.target_cart.contents;
        if (bounces === 0) {
            cart_contents[this.product_id] -= 1 + bounces;
        } else if (bounces >= 2) {
            cart_contents[this.product_id] = 0;
        }

        if (cart_contents[this.product_id] === 0) {
            delete cart_contents[this.product_id];
            this.decrement_btn.style.display = 'none';
        }
        this.target_cart.update();
    }

    addToCart() {
        const cart_contents = this.target_cart.contents;
        if (cart_contents[this.product_id] == null) {
            cart_contents[this.product_id] = 1;
            this.decrement_btn.style.display = '';
        } else {
            cart_contents[this.product_id] += 1;
        }

        this.target_cart.update();
    }

}

class FaStregCart extends HTMLElement {
    owner: FaStregsystem;
    dialog: FaStregCartDialog;
    contents: { [id: number]: number } = {};

    last_update: number;

    product_counter: Text;
    total_display: HTMLSpanElement;

    constructor(owner: FaStregsystem) {
        super();

        this.owner = owner;

        this.product_counter = text('');
        this.total_display = text('', 'span');

        this.update();

        const product_count = text('Items: ', 'span');
        product_count.append(this.product_counter);

        this.dialog = new FaStregCartDialog(this);

        this.append(product_count, this.total_display, this.dialog);

        pointer_events(this, {
            click: this.on_click.bind(this),
            hold: [800, this.on_hold.bind(this), this.on_release.bind(this)],
        });

    }

    async on_click() {
        const response = await this.dialog.show();
        if (response !== "confirm" || Object.keys(this.contents).length === 0)
            return;

        const {profile} = this.owner;
        const buy_string = this.get_buy_string(profile.username);
        enable_loading_indicator(true);
        try {
            await backend.post_sale(buy_string, default_room, profile.id);
            const new_balance = await backend.get_user_balance(profile.id);
            events.profile_balance_change.dispatch({old_balance: profile.balance, new_balance});
            this.contents = {};
            this.update();
        } catch (e) {
            alert("Purchase failed.");
            console.error(e);
        }
        disable_loading_indicator();
    }

    on_hold() {
        this.dialog.open_preview();
    }

    on_release() {
        this.dialog.close_preview();
    }

    /**
     * Updates the HTML dom to reflect the current internal state.
     */
    update() {
        this.last_update = Date.now();
        this.product_counter.textContent = this.compute_product_count().toString();
        this.total_display.innerText = format_stregdollar(this.compute_total());
        document.querySelectorAll('.dec')
            .forEach((e: HTMLElement) => e.style.display = 'none');
    }

    /**
     * Compute the total value of the carts contents.
     */
    compute_total(): number {
        return Object.keys(this.contents)
            .map(id => this.owner.catalogue[id][1] * this.contents[id])
            .reduce(reduce_sum, 0);
    }

    /**
     * Compute the number of items in the cart.
     */
    compute_product_count(): number {
        return Object.keys(this.contents)
            .map(key => this.contents[key])
            .reduce(reduce_sum, 0);
    }

    /**
     * Convert the cart contents into a stregsystem multibuy string.
     */
    get_buy_string(username: string): string {
        const a = Object.keys(this.contents)
            .filter(key => this.contents[key] > 0)
            .map(key => `${key}:${this.contents[key]}`)
            .join(' ');
        return `${username} ${a}`;
    }
}

class FaStregCartDialog extends HTMLElement {
    cart: FaStregCart;
    dialog: HTMLDialogElement;
    table: HTMLTableSectionElement;

    last_update: number;

    constructor(cart) {
        super();
        this.setAttribute("mode", "hidden");

        this.cart = cart;

        const table = document.createElement('table');
        const head = document.createElement('thead');
        const h_row = document.createElement('tr');
        h_row.append(
            text('product', 'td'),
            text('count', 'td'),
            text('price', 'td'),
            text('total', 'td'),
        );

        head.append(h_row);
        this.table = document.createElement('tbody');

        table.append(head, this.table);

        this.dialog = document.createElement('dialog');
        this.dialog.append(table);
        // Stop pointer event propagation past the model.
        // Also closes the model if the backdrop is clicked.
        this.dialog.addEventListener('pointerdown', function (e) {
            e.stopPropagation();
            const {left, right, top, bottom} = (e.target as HTMLElement).getBoundingClientRect();
            if (e.clientX < left || right < e.clientX || e.clientY < top || bottom < e.clientY) {
                this.close();
            }
        });

        const dialog_form = document.createElement('form');
        dialog_form.method = 'dialog';

        dialog_form.append(
            text('cancel', 'button'),
            text('confirm', 'button'),
        );

        (dialog_form.children[0] as HTMLButtonElement).value = "";
        (dialog_form.children[1] as HTMLButtonElement).value = "confirm";

        this.dialog.append(dialog_form);
        this.append(this.dialog);
    }

    confirm_purchase(): Promise<CartDialogResponse> {
        return new Promise((resolve) => {
            const {dialog} = this;
            const cb = () => {
                dialog.removeEventListener('close', cb);
                resolve(dialog.returnValue as CartDialogResponse);
            };

            dialog.addEventListener('close', cb);
            this.dialog.showModal();
        });
    }

    close_preview() {
        this.setAttribute("mode", "hidden");
        this.dialog.close("");
    }

    open_preview() {
        if (this.dialog.open)
            return;

        this.generate_table_contents();
        this.setAttribute("mode", "preview");
        this.dialog.show();
    }

    async show(): Promise<CartDialogResponse> {
        // This case typically occurs if the user taps the backdrop.
        // We just dismiss the modal when this happens.
        if (this.dialog.open) {
            this.dialog.close("");
            return "";
        }

        this.generate_table_contents();
        this.setAttribute("mode", "modal");

        const response = await this.confirm_purchase();

        this.setAttribute("mode", "hidden");
        return response;
    }

    generate_table_contents() {
        if (this.last_update === this.cart.last_update)
            return;

        this.last_update = this.cart.last_update;

        const {catalogue, profile} = this.cart.owner;
        const contents = as_tuples(this.cart.contents);
        let product_rows;

        if (contents.length > 0) {
            product_rows = contents.map(([id, count]) => {
                const row = document.createElement('tr');

                row.append(
                    text(catalogue[id][0], 'td'), // name
                    text(count.toString(), 'td'), // count
                    text(format_stregdollar(catalogue[id][1]), 'td'), // indv price
                    text(format_stregdollar(catalogue[id][1] * count), 'td'), // total
                );

                return row;
            });
        } else {
            const row = document.createElement('tr');
            row.append(text('Your cart is empty!', 'td'));
            product_rows = [row];
        }

        product_rows[0].classList.add('table-rule');

        const total = this.cart.compute_total();
        const summary_rows = [["Total", total], ["New Balance", profile.balance - total]]
            .map(([label, price]) => {
                const row = document.createElement('tr');

                row.append(
                    text(label as string, 'td'),
                    text('', 'td'),
                    text('', 'td'),
                    text(format_stregdollar(price as number), 'td'),
                );

                return row;
            });

        summary_rows[0].classList.add('table-rule');

        this.table.innerHTML = '';
        this.table.append(...product_rows, ...summary_rows);
    }
}

/**
 * HTML element used to display profile information in the header.
 * Defines the custom element `<fa-profile-widget>`.
 */
class FaProfileWidget extends HTMLElement {
    profile: UserProfile;

    balance: Text;
    username: Text;

    constructor() {
        super();
        events.profile_loaded.register_handle(this.on_profile_load, this);
        events.profile_balance_change.register_handle(this.on_balance_change, this);

        this.balance = document.createTextNode("");
        this.username = document.createTextNode("");
        this.append(
            this.username,
            document.createElement('br'),
            this.balance,
        );
    }

    on_profile_load(profile: UserProfile) {
        this.profile = profile;
        this.username.textContent = profile.username;
        this.balance.textContent = format_stregdollar(profile.balance);
    }

    on_balance_change(change: BalanceChange) {
        this.balance.textContent = format_stregdollar(change.new_balance);
    }
}

class FaStregsystem extends HTMLElement {

    profile: UserProfile;
    catalogue: ActiveProductList;
    cart: FaStregCart;

    constructor() {
        super();

        console.log("initiating stregsystem module");

        events.ready.register_handle(this.on_ready, this);
        events.profile_loaded.register_handle(this.on_profile_loaded, this);
        events.profile_balance_change.register_handle(this.on_profile_balance_change, this);
        events.access_update.register_handle(this.on_access_status, this);


        this.cart = new FaStregCart(this);

    }

    on_ready() {
        if (this.profile == null) {
            this.render_profile_prompt();
        } else {
            void this.render_catalogue(this.profile);
        }
    }

    on_profile_loaded(profile: UserProfile) {
        this.profile = profile;
    }

    on_profile_balance_change(change: BalanceChange) {
        this.profile.balance = change.new_balance;
    }

    /**
     * This is executed when the access status is updated.
     * @param status
     */
    on_access_status(status: AccessStatus) {
        if (status === AccessStatus.StregsystemUnavailable) {
            console.log("unable to connect to stregsystem");
            this.classList.add('flex-center', 'center');
            this.innerHTML = access_failure_msg;
        } else if (status !== AccessStatus.ApiAvailable && backend === api_backend) {
            console.log("target stregsystem instance does not have API support");
            this.classList.add('flex-center', 'center');
            this.innerHTML = access_no_api;
        }
    }

    async render_catalogue(_: UserProfile) {
        this.innerHTML = '';

        const product_container = document.createElement('div');
        product_container.classList.add("border-outer");

        this.catalogue = await backend.get_active_products(default_room);
        const product_elements = Object.keys(this.catalogue)
            .map(key => new FaStregProduct(this.cart, parseInt(key), ...this.catalogue[key]));

        product_container.append(...product_elements);

        this.append(
            "Individual items can be purchased by pressing and holding on a product.",
            product_container,
            this.cart,
        );
        disable_loading_indicator();
    }

    render_profile_prompt() {
        const prompt_msg = 'In order to use stregsystemet you must first select the account that you will be using.';
        this.classList.add('profile-prompt');
        this.innerText = prompt_msg;

        const name_input = document.createElement('input');
        name_input.placeholder = 'Username';

        const submit_button = document.createElement('button');
        submit_button.innerText = 'Submit';

        submit_button.addEventListener('click', void_promise(async () => {
            if (name_input.value.length === 0)
                return;

            this.style.display = 'none';
            enable_loading_indicator();

            const name = name_input.value;
            try {
                const profile = await fetch_profile(name);
                await AppDatabase.instance.settings.put(profile, AppDatabase.active_profile_key);
                events.profile_loaded.dispatch(profile);
                this.classList.remove('profile-prompt');
                await this.render_catalogue(profile);
            } catch (_) {
                this.childNodes[0].nodeValue = `${prompt_msg} Unable to find user by name "${name}".`;
                disable_loading_indicator();
            }

            this.style.display = '';

        }));

        this.append(name_input, submit_button);
        disable_loading_indicator();
    }

}

export const init = async () => {
    customElements.define("fa-streg-product", FaStregProduct);
    customElements.define("fa-streg-cart", FaStregCart);
    customElements.define("fa-streg-cart-dialog", FaStregCartDialog);
    customElements.define("fa-stregsystem", FaStregsystem);
    customElements.define("fa-profile-widget", FaProfileWidget);

    await backend.init();

    events.profile_balance_change.register_handle(({new_balance}) => {
        void AppDatabase.instance.settings
            .update(AppDatabase.active_profile_key, {balance: new_balance});
    });

    load_saved_profile()
        .finally(() => {
            events.ready.dispatch(null);
        });

};

