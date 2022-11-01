/**
 * This module contains several highly unnecessary abstractions
 * for writing asynchronous code. Some more cursed than others.
 * (A few of them may actually be truly useful :) )
 */

import {cond, Condition} from "./cond";
import {Predicate} from "./common";

declare global {
    interface Promise<T> {
        if<U>(c: Predicate<T>, v: U): AsyncCondition<U>;
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
 */
export const promise_cond = <T>(cond: boolean, value: T, reason?: any): Promise<T> =>
    cond ? Promise.resolve(value) : Promise.reject(reason);

Promise.prototype.if = <U>(predicate, c_val) => new AsyncCondition<U>(this.then(val => cond(predicate(val), c_val)));

export class AsyncCondition<A> {

    inner: Promise<Condition<A>>;

    constructor(p: Promise<Condition<A>>) {
        this.inner = p;
    }

    then<B>(v: B): AsyncCondition<B> {
        return new AsyncCondition(this.inner.then(cond => cond.then(v)));
    }

    then_if<B>(f: (v: A) => Condition<B>): AsyncCondition<B> {
        return new AsyncCondition(this.inner.then(cond => cond.then_if(f)));
    }

    then_if_async<B>(f: (v: A) => AsyncCondition<B>): AsyncCondition<B> {
        const {inner} = this;
        const new_inner = this.inner
            .then(cond => cond
                .then_map(v => f(v).inner)
                .else(inner)
                .resolve());
        return new AsyncCondition(new_inner);
    }

    else(v: A): AsyncCondition<A> {
        return new AsyncCondition<A>(this.inner.then(cond => cond.else(v)));
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
            .then(cond => cond.else(fallback).resolve());
    }

}
