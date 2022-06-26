/**
 * Replace all found whitespaces by '+' character, in the given string.
 * Useful for URL query params.
 * @param string - The query string to encode.
 * @returns The encoded string.
 */
export const encodeQueryString = (string: string) => string.replace(/\s+/g, '+')
