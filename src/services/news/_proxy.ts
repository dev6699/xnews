let PROXY_URL = ''

try {
    // handle cf functions error
    const proxy = process.env.EXPO_PUBLIC_PROXY_URL
    if (proxy) {
        PROXY_URL = proxy
    }
} catch { }

export const proxify = (url: string) => {
    if (PROXY_URL) {
        return PROXY_URL + url
    }
    return url
}

export const request = (input: RequestInfo, init?: RequestInit<RequestInitCfProperties>) => {
    let _init = {
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
        }
    } as RequestInit<RequestInitCfProperties>

    if (init) {
        _init = init
    }
    return fetch(
        input,
        _init
    );
}