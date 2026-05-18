export type Forget<T, K extends keyof T> = Omit<T, K>;
