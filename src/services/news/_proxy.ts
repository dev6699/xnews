import { isWeb } from "../../utils/platform"

const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL

export const proxify = (url: string) => {
    if (isWeb) {
        return PROXY_URL + url
    }
    return url
}

export const request = (url: string) => {
    return fetch(
        url,
        {
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
            }
        }
    );
}