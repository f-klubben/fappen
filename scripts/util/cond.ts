/**
 * A module that provides a structure that abstracts transformations
 * over a conditional state. The structure is largely functionally
 * equivalent to a Maybe/Option type. The difference lies primarily
 * in the functions we use to produce and consume the structure.
 *
 * Mostly intended as a foundational structure for the `AsyncConditional` structure,
 * but can be used in a standalone manner.
 *
 * If we ever introduce a proper Maybe/Option type we should consider
 * making this into an alias/newtype of that, filling in gaps as needed.
 */

import {PredicateFn} from "./common";

/**
 * Produces a truth condition holding the specified value.
 * @param val
 */
export const truth = <T>(val: T): Truth<T> => new Truth(val);

/**
 * Produces a falsity condition.
 */
export const falsity = <T>(): Falsity<T> => new Falsity();

/**
 * Creates a Condition value based on the given predicate value and a value.
 * @param predicate The predicate determining the condition state.
 * @param v The conditional value.
 */
export const cond = <T>(predicate: boolean, v: T) => predicate ? truth(v) : falsity<T>();

/**
 * Creates a function that will create a condition value based on a given predicate function and value.
 * @param p The predicate determining the condition state.
 */
export const f_cond = <T, Input>(p: PredicateFn<Input>): (i: Input, v: T) => Condition<T> => (i, v) => cond(p(i), v);

/**
 * An interface describing the common functionality of the `Condition<T>`
 * union type as well as its constituents `Truth<T>` and `Falsity<T>`.
 */
export interface Conditional<A> {
    /**
     * Change the value bound by the condition if truthy.
     * Short for `then_map(_ => v)`.
     * @param v The new value.
     */
    then_use<B>(v: B): Condition<B>;

    /**
     * Apply the given function `f` to the value bound by the condition.
     * @param f The function to apply to the contained value.
     */
    then_map<B>(f: (a: A) => B): Condition<B>;

    /**
     * Chains a truth condition into a new condition.
     * @param f A function that produces a new condition from the bound value.
     */
    then_if<B>(f: (v: A) => Condition<B>): Condition<B>;

    /**
     * Converts the condition into a truth state with the given value
     * if the current condition state is a falsity.
     * @param v
     */
    else_use(v: A): Truth<A>;

    /**
     * Converts the condition into a truth state holding the result of the given function.
     *
     * Note: this isn't really a mapping function, but is named as such regardless for the sake
     * of keeping symmetry with the `then_*` functions.
     * @param f
     */
    else_map(f: () => A): Truth<A>;

    /**
     * Chain a falsity condition into a new condition.
     * @param f A function that produces a new condition.
     */
    else_if(f: () => Condition<A>): Condition<A>;

    /**
     * Returns whether the condition is in the truth state.
     *
     * It is worth noting that this function isn't always enough
     * to convince the compiler (and/or intelisense) that something
     * is actually a Truth instance. IDK why but it just isn't ¯\_(ツ)_/¯.
     * If you're trying to convince either of those (in order to stop them from
     * complaining about using Truth#resolve) just use an `instanceof` check instead.
     */
    is_truth(): this is Truth<A>;

    /**
     * Return whether the condition is in the falsity state.
     */
    is_falsity(): this is Falsity<A>;
}

/**
 * A type that abstracts over conditional values.
 */
export type Condition<T> = Truth<T> | Falsity<T>;

export class Truth<A> implements Conditional<A> {
    val: A;

    constructor(val: A) {
        this.val = val;
    }

    then_use<B>(v: B): Truth<B> {
        return truth<B>(v);
    }

    then_map<B>(f: (a: A) => B): Condition<B> {
        return truth(f(this.val));
    }

    then_if<B>(f: (v: A) => Condition<B>): Condition<B> {
        return f(this.val);
    }

    /**
     * Resolves the condition returning the stored value.
     * Note that this is only available for `Truth` so you will need to
     * check the type before trying to call resolve on a `Condition`.
     */
    resolve(): A {
        return this.val;
    }

    else_use(_: A): Truth<A> {
        return this;
    }

    else_map(f: () => A): Truth<A> {
        return this;
    }

    else_if(f: () => Condition<A>): Condition<A> {
        return this;
    }

    is_truth(): this is Truth<A> {
        return true;
    }

    is_falsity(): this is Falsity<A> {
        return false;
    }
}

export class Falsity<A> implements Conditional<A> {
    then_use<B>(_: B): Falsity<B> {
        return falsity();
    }

    then_if<B>(f: (v: A) => Condition<B>): Condition<B> {
        return falsity();
    }

    then_map<B>(f: (a: A) => B): Condition<B> {
        return falsity();
    }

    else_use(v: A): Truth<A> {
        return truth(v);
    }

    else_map(f: () => A): Truth<A> {
        return truth(f());
    }

    else_if(f: () => Condition<A>): Condition<A> {
        return f();
    }

    is_truth(): this is Truth<A> {
        return false;
    }

    is_falsity(): this is Falsity<A> {
        return true;
    }
}
