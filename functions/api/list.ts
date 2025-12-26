import { NewsService } from "../../src/services/news";

export const onRequest: PagesFunction = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const provider = url.searchParams.get('provider')
    if (!provider || !NewsService[provider]) {
        return new Response('Invalid provider', { status: 400 });
    }

    const page = Number(url.searchParams.get('page') || 0);
    const listr = await NewsService[provider].list(page)
    return new Response(JSON.stringify(listr), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Expose-Headers': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400'
        },
    });
};