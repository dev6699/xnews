import { load } from 'cheerio';
import { getTimeAgo } from '../../utils/time';
import { BaseNews, Content, TNewsProvider } from './types';
import { proxify, request } from './_proxy';

const _BASE_URL = "https://www.enanyang.my"
const BASE_URl = proxify(_BASE_URL)

type NewsList = {
    ID: number
    permalink: string
    title: string
    cat_label: string
    created: string
    post_date_iso8601: string
    image: string
}


export const list: TNewsProvider['list'] = async (page = 0) => {
    const lists: BaseNews[] = []
    const data = await request(`${BASE_URl}/api/category-posts?cat=2&offset=0&pagenum=${page + 1}&excludeids=`).then(r => r.json());
    for (const d of (data as NewsList[])) {
        lists.push({
            link: d.permalink.replace(_BASE_URL, ''),
            nid: `${d.ID}`,
            title: d.title,
            image: d.image,
            category: d.cat_label,
            created: getTimeAgo(new Date(d.post_date_iso8601).getTime())
        })
    }

    return lists
}

export const view: TNewsProvider['view'] = async (link: string) => {
    const data = await request(`${BASE_URl}/${link}`).then(r => r.text())

    const $ = load(data)
    const title = $('.article-page-main-title').first().text()
    const date = $('.article_date_meta').attr('data-datestr')!
    const contents: Content[] = []
    const el = $('.article-page-post-content')
    const img = $(el).find('figure > img').attr('src')
    const imgCaption = $(el).find('figcaption').text()
    if (img) {
        contents.push({
            type: 'image',
            uri: img,
            caption: imgCaption,
        })
    }

    $(el).find('p').each((i, tel) => {
        let text = $(tel).text()

        if (text) {
            contents.push({
                type: 'text',
                data: text
            })
        }
    })

    return {
        title,
        date,
        contents
    }
}

export const language: TNewsProvider['language'] = 'zh'