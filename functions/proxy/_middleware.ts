export const onRequestGet: PagesFunction = async ({ request }) => {

    const url = new URL(request.url)

    return fetch(url.search.split('?url=')[1], {
        headers: {
            "user-agent": "okhttp/4.9.2",
        }
    }).then(response => {
        const newResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers)  // Copy the headers
        });

        // Modify headers on the new response
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Max-Age', '86400');
        return newResponse;
    });
};