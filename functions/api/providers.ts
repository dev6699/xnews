import { NewsService } from "../../src/services/news";

export const onRequest: PagesFunction = async ({ request }: { request: Request }) => {
    return new Response(JSON.stringify(Object.keys(NewsService)), {
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