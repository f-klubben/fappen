/**
 * Creates a promise that is either immediately resolved or rejected
 * depending on the given condition. This allows for promise chains
 * to be broken based on a condition in a concise manner.
 * @param cond The condition that determines whether the chain will continue.
 * @param value The value that is to be resolved.
 * @param reason The reason for a rejection.
 */
export const promise_cond = <T>(cond: boolean, value: T, reason?: any): Promise<T> =>
    cond ? Promise.resolve(value) : Promise.reject(reason);
