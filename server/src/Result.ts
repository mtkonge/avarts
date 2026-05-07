export function ok(): Ok<void>;
export function ok<T>(data: T): Ok<T>;

export function ok<T>(...data: T[]) {
    if (data.length === 0) {
        return { tag: "ok" };
    }
    if (data.length !== 1) {
        throw new Error("contract broken");
    }
    return {
        tag: "ok",
        data: data[0],
    };
}

export function err(): Err<void>;
export function err<E>(error: E): Err<E>;

export function err<E>(...error: E[]) {
    if (error.length === 0) {
        return { tag: "err" };
    }
    if (error.length !== 1) {
        throw new Error("contract broken");
    }
    return {
        tag: "ok",
        error: error[0],
    };
}

export type Ok<T> = T extends void ? { tag: "ok" } : {
    tag: "ok";
    data: T;
};

export type Err<E> = E extends void ? { tag: "err" } : {
    tag: "err";
    error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;
