import { load } from 'cheerio';

import { BaseNews, Content, TNewsProvider } from './types';
import { proxify, request } from './_proxy';
import { dateStringToTimestamp, getTimeAgo } from '../../utils/time';

const BASE_URl = proxify("https://www.investing.com")


export const list: TNewsProvider['list'] = async (page = 0) => {
    const lists: BaseNews[] = []
    const data = await request(`${BASE_URl}/news/stock-market-news/${page + 1}`).then(r => r.text());
    const $ = load(data)

    const dataStr = $('#__NEXT_DATA__').text()
    const dataJSON = JSON.parse(dataStr) as {
        props: {
            pageProps: {
                state: {
                    newsStore: {
                        _news:
                        {
                            id: string
                            title: string
                            link: string
                            published_at: string
                            imageHref: string
                        }[]
                    }
                }
            }
        }
    }

    const { _news } = dataJSON.props.pageProps.state.newsStore
    _news.forEach(n => {
        const created = new Date(n.published_at)
        lists.push({
            link: n.link,
            nid: n.id,
            title: n.title,
            image: n.imageHref,
            category: '',
            created: getTimeAgo(created.getTime()),
        })
    })

    return lists
}

export const view: TNewsProvider['view'] = async (link) => {
    const data = await request(`${BASE_URl}/${link}`).then(r => r.text());

    const $data = load(data)
    const dataStr = $data('#__NEXT_DATA__').text()
    const dataJSON = JSON.parse(dataStr) as {
        props: {
            pageProps: {
                state: {
                    newsStore: {
                        _article: {
                            title: string
                            body: string
                            published_at: string
                            imageHref: string
                        }
                    }
                }
            }
        }
    }

    const { _article } = dataJSON.props.pageProps.state.newsStore
    const $ = load(_article.body)
    const contents: Content[] = [
        {
            type: 'image',
            uri: $('img').attr('src') ?? _article.imageHref,
            caption: $('img').attr('title') ?? ''
        }
    ]

    $('p').each((_, el) => {
        const text = $data(el).text()
        contents.push(
            {
                type: 'text',
                data: text
            }
        )
    })

    const date = new Date(_article.published_at)
    return {
        title: _article.title,
        date: getTimeAgo(date.getTime()),
        contents: contents,
    }
}

export const language: TNewsProvider['language'] = 'en'
