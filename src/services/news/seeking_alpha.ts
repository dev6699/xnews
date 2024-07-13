import { load } from 'cheerio';

import { getTimeAgo } from '../../utils/time';
import { BaseNews, Content, TNewsProvider } from './types';
import { proxify, request } from './_proxy';

const BASE_URl = proxify("https://seekingalpha.com")


let lists: BaseNews[] = []

export const list: TNewsProvider['list'] = async (page = 0) => {
    page += 1
    if (page === 1 && lists.length) {
        lists = []
    }
    const data = await request(`${BASE_URl}/api/v3/news?filter[category]=market-news::all&filter[since]=0&filter[until]=0&include=author,primaryTickers,secondaryTickers&isMounting=true&page[size]=25&page[number]=${page}`).then(r => r.json());
    console.log(data)
    for (const d of (data as {
        data: {
            id: string
            links: {
                self: string,
                uriImage: string
            },
            attributes: {
                publishOn: string,
                title: string
            }
        }[]
    }).data) {
        lists.push({
            image: d.links.uriImage,
            link: d.links.self,
            nid: d.id,
            title: d.attributes.title,
            category: '',
            created: getTimeAgo(new Date(d.attributes.publishOn.slice(0, -6)).getTime())
        })
    }

    return lists
}

export const view: TNewsProvider['view'] = async (link) => {
    const data = await request(`${BASE_URl}/${link}`).then(r => r.text());

    const $ = load(data)
    let news = {} as {
        article: {
            response: {
                data: {
                    attributes: {
                        title: string
                        content: string
                        publishOn: string
                    }
                }
            }
        }
    }
    $('script').each((_, el) => {
        const text = $(el).text()
        if (text.includes('window.SSR_DATA')) {
            news = JSON.parse(text.split('window.SSR_DATA = ')[1].slice(0, -1))
        }
    })

    const $2 = load(news.article.response.data.attributes.content)
    const contents: Content[] = []

    let reachMore = false
    $2('figure, div, li, p').each((_, el) => {
        if ($2(el).attr('id') == "more-links") {
            reachMore = true
        }

        if (reachMore) {
            return
        }

        if (el.tagName === 'figure') {
            contents.push(
                {
                    type: 'image',
                    caption: $2(el).find('figcaption > p').text()!,
                    uri: $2(el).find('picture > img').attr('src')!
                }
            )
            return
        }

        if ($(el).hasClass('item-credits')) {
            return
        }


        const text = $(el).text()


        if (text === '') {
            return
        }

        if (text.includes('via Getty Images')) {
            return
        }

        contents.push(
            {
                type: 'text',
                data: text
            }
        )
    })

    return {
        title: news.article.response.data.attributes.title,
        date: getTimeAgo(new Date(news.article.response.data.attributes.publishOn.slice(0, -6)).getTime()),
        contents: contents,
    }

}

export const language: TNewsProvider['language'] = 'en'

