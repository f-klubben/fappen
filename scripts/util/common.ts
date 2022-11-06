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
 * Wraps a given value in a function.
 * @param v
 */
export const wrap = <T>(v: T) => () => v;

/**
 * Computes the sum through reduction.
 * For use with `Array#reduce`.
 */
export const reduce_sum = (acc: number, v: number) => acc + v;