import { isWeb } from "../../utils/platform"

const PROXY_URL = process.env.MY_ENVIRONMENT === 'production' ? "/proxy?url=" : "http://localhost:8080/proxy?url="

export const proxify = (url: string) => {
    if (isWeb) {
        return PROXY_URL + url
    }
    return url
}