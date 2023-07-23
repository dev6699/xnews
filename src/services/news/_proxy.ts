import { isWeb } from "../../utils/platform"

const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL

export const proxify = (url: string) => {
    if (isWeb) {
        return PROXY_URL + url
    }
    return url
}