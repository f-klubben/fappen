/**
 * A module containing common type definitions
 * and helper functions.
 */

/**
 * Type representing a predicate function taking
 * a single argument and returning a boolean.
 */
export type PredicateFn<T> = (v: T) => boolean;

/**
 * Type representing a function that maps `A -> B`.
 */
export type MapFn<A, B> = (a: A) => B;

/**
 * Type representing a function that takes no input and returns nothing.
 */
export type Action = () => void;

/**
 * Wraps a given value in a function.
 * @param v
 */
export const wrap = <T>(v: T) => () => v;

/**
 * Computes the sum through reduction.
 * For use with `Array#reduce`.
 */
export const reduce_sum = (acc: number, v: number) => acc + v;

export const disable_loading_indicator = () => {
    document.getElementById('loading-indicator').style.display = 'none';
};

/**
 * Enables the loading indicator. Note this still
 * requires the element to have been added manually to the page.
 */
export const enable_loading_indicator = () => {
    document.getElementById('loading-indicator').style.display = 'block';
};

/**
 * Creates a debounced function for use with event handlers that have either
 * rapid successive occurrences (the `input` event) or have differing behaviour
 * depending on the number occurrences (click vs double click).
 * @param delay A duration in milliseconds determining for how long to debounce.
 * @param f The function that should be called when the event actually occurs.
 */
export const debounce = <E>(delay: number, f: (e: E, b: number) => void): MapFn<E, void> => {
    let timeout;
    let bounces = 0;
    return (e: E) => {
        if (timeout != null) {
            clearTimeout(timeout);
            bounces += 1;
        }

        timeout = setTimeout(() => {
            f(e, bounces);
            bounces = 0;
            timeout = null;
        }, delay);
    };
};

export interface PointerHandles {
    /**
     * A handle that responds to press and hold interactions.
     * The first element is how long the press has to be held for in milliseconds.
     */
    hold?: [length: number, handle: Action],

    /**
     * A normal click event handle. Note that the presence of the `n_click` handle will
     * overwrite this handle.
     */
    click?: MapFn<PointerEvent, void>,

    /**
     * A handle that counts click events. The counting is done by debouncing
     * so only the last click event will invoke the handle.
     *
     * Note: if both `n_click` and `click` are present then `n_click will be used
     * and `click` ignored.
     * @param e The event information.
     * @param b The number bounces that occurred (this is click_count - 1).
     */
    n_click?: (e: PointerEvent, b: number) => void,
}

/**
 * Registers event handles for handling various pointer events.
 * @param target The target HTML element that produces the events.
 * @param handles The event handles that we are registering.
 */
export const pointer_events = (target: HTMLElement, handles: PointerHandles) => {
    let active_pointer;
    let click_handle;

    if ('click' in handles)
        click_handle = handles['click'];

    if ('n_click' in handles) {
        if (click_handle != null)
            console.warn('incompatible events given in `pointer_events` (click + n_click)');
        click_handle = debounce(200, handles['n_click']);
    }

    const check_hold = 'hold' in handles;
    let hold_timeout;

    target.addEventListener('pointerdown', e => {
        if (e.button !== 0 || active_pointer != null)
            return;

        active_pointer = e.pointerId;

        if (check_hold) {
            const [length, handle] = handles.hold;
            hold_timeout = setTimeout(() => {
                // Setting the active_pointer to null cancels the pointerup event
                active_pointer = null;
                hold_timeout = null;
                handle();
            }, length);
        }
    });

    target.addEventListener('pointerup', e => {
        if (e.button !== 0 || e.pointerId != active_pointer)
            return;

        if (hold_timeout != null) {
            clearTimeout(hold_timeout);
            hold_timeout = null;
        }

        if (click_handle != null)
            click_handle(e);

        active_pointer = null;
    });

    target.addEventListener('pointercancel', e => {
        console.log(`pointercancel`)
        if (e.pointerId == active_pointer) {
            active_pointer = null;
            if (hold_timeout != null) {
                clearTimeout(hold_timeout);
                hold_timeout = null;
            }
        }
    })

};
