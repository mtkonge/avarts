export function ok<T>(data: T): Ok<T> {
    return {
        tag: "ok",
        data,
    };
}

export function err<E>(error: E): Err<E> {
    return {
        tag: "err",
        error,
    };
}

export type Ok<T> = {
    tag: "ok";
    data: T;
};

export type Err<E> = {
    tag: "err";
    error: E;
};

export type Result<T, E> = Err<E> | Ok<T>;
