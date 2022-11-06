/**
 * This module contains several highly unnecessary abstractions
 * for writing asynchronous code. Some more cursed than others.
 * (A few of them may actually be truly useful :) )
 */

import {cond, Condition, falsity} from "./cond";
import {MapFn, PredicateFn, wrap} from "./common";

/*
    Declares extension methods for the `Promise<T>` type.
    Actual implementations are separate from the declare-block.
 */

declare global {
    interface Promise<T> {
        if<U>(c: PredicateFn<T>, v: U | MapFn<T, U>): AsyncCondition<U>;
    }
}

/**
 * Creates a promise that is either immediately resolved or rejected
 * depending on the given condition. This allows for promise chains
 * to be broken based on a condition in a concise manner.
 *
 * If you want/need to chain multiple async conditions consider using
 * the `AsyncCondition<T>` interface.
 *
 * @param cond The condition that determines whether the chain will continue.
 * @param value The value that is to be resolved.
 * @param reason The reason for a rejection.
 * @deprecated Use `AsyncCondition` through `Promise#if` instead
 */
export const promise_cond = <T>(cond: boolean, value: T, reason?: any): Promise<T> =>
    cond ? Promise.resolve(value) : Promise.reject(reason);

/**
 * Chains the promise into an `AsyncCondition` using the given predicate
 * and the given value.
 * @param predicate The predicate of the condition.
 * @param cond_val A value or a function producing a value by mapping `T -> U`.
 */
Promise.prototype.if = function <U>(predicate, cond_val): AsyncCondition<U> {
    if (typeof cond_val !== "function") {
        cond_val = wrap(cond_val);
    }

    return new AsyncCondition<U>(this.then(val => cond(predicate(val), cond_val(val))))
};

export class AsyncCondition<A> {

    inner: Promise<Condition<A>>;

    constructor(p: Promise<Condition<A>>) {
        this.inner = p;
    }

    then_use<B>(v: B): AsyncCondition<B> {
        return new AsyncCondition(this.inner.then(cond => cond.then_use(v)));
    }

    then_if<B>(f: MapFn<A, Condition<B>>): AsyncCondition<B> {
        return new AsyncCondition(this.inner.then(cond => cond.then_if(f)));
    }

    then_if_async<B>(f: MapFn<A, AsyncCondition<B>>): AsyncCondition<B> {
        const {inner} = this;
        const new_inner = this.inner
            .then(cond => cond
                .then_map(v => f(v).inner)
                .else_use(inner.then(cond => cond.then_if(() => falsity<B>())))
                .resolve());
        return new AsyncCondition(new_inner);
    }

    else_use(v: A): AsyncCondition<A> {
        return new AsyncCondition<A>(this.inner.then(cond => cond.else_use(v)));
    }

    else_if(f: () => Condition<A>): AsyncCondition<A> {
        return new AsyncCondition<A>(this.inner.then(cond => cond.else_if(f)));
    }

    else_if_async(f: () => AsyncCondition<A>): AsyncCondition<A> {
        const {inner} = this;
        const new_inner = this.inner
            .then(cond => {
                if (cond.is_falsity()) {
                    return f().inner;
                } else {
                    return inner;
                }
            });
        return new AsyncCondition(new_inner);
    }

    else_promise(fallback: A): Promise<A> {
        return this.inner
            .then(cond => cond.else_use(fallback).resolve());
    }

}

export class AppEvent<Event> {
    handles: { once: boolean, fn: MapFn<Event, void> }[] = [];
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    register_handle(handle: MapFn<Event, void>, once: boolean = false) {
        this.handles.push({once, fn: handle});
    }

    dispatch(event: Event) {
        for (const handle of this.handles) {
            try {
                handle.fn(event);
                if (handle.once)
                    handle.fn = () => void 0;
            } catch (e) {
                console.error(`Error executing dispatch handle for event \`${this.id}\``);
                console.error(e);
            }
        }
    }

}
