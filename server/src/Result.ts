export function ok(): Ok<void>;
export function ok<T>(data: T): Ok<T>;

export function ok<T>(...data: T[]) {
    if (data.length === 0) {
        return { ok: true };
    }
    if (data.length !== 1) {
        throw new Error("contract broken");
    }
    return {
        ok: true,
        data: data[0],
    };
}

export function err(): Err<void>;
export function err<E>(error: E): Err<E>;

export function err<E>(...error: E[]) {
    if (error.length === 0) {
        return { ok: false };
    }
    if (error.length !== 1) {
        throw new Error("contract broken");
    }
    return {
        ok: false,
        error: error[0],
    };
}

export type Ok<T> = T extends void ? { ok: true } : {
    ok: true;
    data: T;
};

export type Err<E> = E extends void ? { ok: false } : {
    ok: false;
    error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;
