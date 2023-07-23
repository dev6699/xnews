import axios from 'axios';
import { load } from 'cheerio';

import { getTimeAgo } from '../../utils/time';
import { BaseNews, Content, TNewsProvider } from './types';
import { proxify } from './_proxy';

const BASE_URl = proxify("https://theedgemalaysia.com")

type NewsList = {
    nid: string
    type: string
    language: string
    category: string
    options: string
    flash: string
    tags: string
    edited: string
    title: string
    created: string
    updated: string
    author: string
    source: string
    audio: string
    audioFlag: number
    alias: string
    video_url: string
    img: string
    caption: string
    summary: string
}

let lists: BaseNews[] = []

export const list: TNewsProvider['list'] = async (page = 0) => {
    if (page === 0 && lists.length) {
        lists = []
    }
    const offset = page * 10

    const { data } = await axios.get(`${BASE_URl}/api/loadMoreOption?offset=${offset}&option=top`);

    for (const d of (data as { results: NewsList[] }).results) {
        lists.push({
            image: d.img,
            link: d.alias,
            nid: d.nid,
            title: d.title,
            category: d.flash,
            created: getTimeAgo(+d.created)
        })
    }

    return lists
}

export const view: TNewsProvider['view'] = async (link) => {
    const { data } = await axios.get(`${BASE_URl}/${link}`)

    const $ = load(data)
    const dataStr = $('#__NEXT_DATA__').text()
    const dataJSON = JSON.parse(dataStr) as {
        props: {
            pageProps: {
                data: {
                    title: string
                    created: number
                    img: string
                    content: string
                }
            }
        }
    }

    const $2 = load(dataJSON.props.pageProps.data.content)
    const contents: Content[] = [
        { type: 'image', uri: dataJSON.props.pageProps.data.img, caption: '' }
    ]

    $2('div, h3, li').each((_, el) => {
        if ($(el).text() === '') {
            return
        }
        if (el.tagName === 'h3') {
            contents.push(
                {
                    type: 'subtitle',
                    data: $(el).text()
                }
            )
        } else {
            contents.push(
                {
                    type: 'text',
                    data: $(el).text()
                }
            )
        }
    })

    return {
        title: dataJSON.props.pageProps.data.title,
        date: getTimeAgo(dataJSON.props.pageProps.data.created),
        contents: contents,
    }
}

export const language: TNewsProvider['language'] = 'en'
