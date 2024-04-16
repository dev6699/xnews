import { load } from 'cheerio';

import { BaseNews, Content, TNewsProvider } from './types';
import { proxify, request } from './_proxy';
import { dateStringToTimestamp, getTimeAgo } from '../../utils/time';

const BASE_URl = proxify("https://www.investing.com")

let lists: BaseNews[] = []

export const list: TNewsProvider['list'] = async (page = 0) => {
    if (page === 0 && lists.length) {
        lists = []
    }

    const data = await request(`${BASE_URl}/news/stock-market-news/${page + 1}`).then(r => r.text());
    const $ = load(data)

    const dataStr = $('#__NEXT_DATA__').text()
    const dataJSON = JSON.parse(dataStr) as {
        props: {
            pageProps: {
                state: {
                    newsStore: {
                        _newsList:
                        {
                            article_ID: string
                            title: string
                            shortTitle: string
                            href: string
                            imageHref: string
                            provider: string
                            date: string
                            commentsCounter: string
                            snippet: string
                            openInNewTab: boolean
                            mediumImageHref: string
                            news_type: string
                        }[]
                    }
                }
            }
        }
    }

    const { _newsList } = dataJSON.props.pageProps.state.newsStore
    _newsList.forEach(n => {
        const created = new Date(n.date)
        created.setTime(created.getTime() + 8 * 60 * 60 * 1000)
        lists.push({
            link: n.href,
            nid: n.href,
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
                        _newsArticle: {
                            HEADLINE: string
                            BODY: string
                            last_updated: string
                            related_image_big: string
                            image_caption: string
                        }
                    }
                }
            }
        }
    }

    const { _newsArticle } = dataJSON.props.pageProps.state.newsStore
    const $ = load(_newsArticle.BODY)
    const contents: Content[] = [
        {
            type: 'image',
            uri: $('img').attr('src') || `https://i-invdn-com.investing.com/news/${_newsArticle.related_image_big}`,
            caption: $('img').attr('title') || _newsArticle.image_caption
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

    const date = new Date(_newsArticle.last_updated)
    date.setTime(date.getTime() + 8 * 60 * 60 * 1000)
    return {
        title: _newsArticle.HEADLINE,
        date: getTimeAgo(date.getTime()),
        contents: contents,
    }
}

export const language: TNewsProvider['language'] = 'en'
