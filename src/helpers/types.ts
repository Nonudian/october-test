/* The given value or null */
export type Nullable<T> = T | null

/* Array with at least one value */
export type NonEmptyArray<T> = [T, ...Array<T>]
