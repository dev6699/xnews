export const onRequest: PagesFunction = async ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    const headers = request.headers as Headers
    headers.set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36")
    const targetUrl = url.search.split('?url=')[1]
    const targetURL = new URL(targetUrl)
    headers.set("origin", targetURL.origin)
    headers.set("host", targetURL.host)
    headers.set("referer", targetURL.origin)
    headers.set("x-requested-with", "XMLHttpRequest")

    return fetch(targetUrl, {
        headers,
        body: request.method === "GET" ? undefined : request.body,
        method: request.method
    }).then(async response => {
        const newResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers)
        });

        // Modify headers on the new response
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Headers', '*');
        newResponse.headers.set('Access-Control-Max-Age', '86400');
        return newResponse
    });
};