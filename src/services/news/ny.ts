import axios from 'axios';
import { load } from 'cheerio';
import { getTimeAgo } from '../../utils/time';

const BASE_URl = "https://www.enanyang.my"

export type NewsList = {
    title: string
    channel: string
    link: string
    clink: string
    nid: number
    created: string
    teaser_image: string
}

let lists: NewsList[] = []

export const list = async (page = 0): Promise<NewsList[]> => {
    if (page === 0 && lists.length) {
        lists = []
    }
    const { data } = await axios.get(`${BASE_URl}/api/get/home/articles?page=${page}`);

    for (const d of (data as NewsList[])) {
        lists.push({
            ...d,
            teaser_image: `${BASE_URl}/${d.teaser_image}`,
            created: getTimeAgo(+d.created * 1000)
        })
    }

    return lists
}

type ImageContent = {
    type: 'image'
    uri: string
    caption: string
}
type SubtitleContent = {
    type: 'subtitle'
    data: string
}
type TextContent = {
    type: 'text'
    data: string
}
type Content = ImageContent | SubtitleContent | TextContent

export type News = {
    title: string
    date: string
    contents: Content[]
}

export const view = async (link: string): Promise<News> => {
    const { data } = await axios.get(`${BASE_URl}/${link}`)

    const $ = load(data)

    const title = $('#block-enanyang-base-page-title > .content > h1 > span').first().text()
    const date = $('#block-enanyang-base-content .content > .ttr-post-date').text().split(' ').join('')
    const contents: Content[] = []
    $('#block-enanyang-base-content > .content > .ttr_post.node-article > header > .ttr_post_content_inner > .ttr_article > #main-content > .node-article-paragraphs > div > div > div').each((i, el) => {
        const img = $(el).find('img').attr('src')
        const imgCaption = $(el).find('p > span > span > span > span > em > span').text()
        if (img) {
            contents.push({
                type: 'image',
                uri: `${BASE_URl}/${img}`,
                caption: imgCaption,
            })
        }

        const subtitle = $(el).find('span > span > span > strong >span > span').text()
        if (subtitle) {
            contents.push({
                type: 'subtitle',
                data: subtitle
            })
        }

        $(el).find('p').each((i, tel) => {
            let text = $(tel).text()

            if (i === 0 && [imgCaption, subtitle].includes(text)) {
                return
            }

            if (text === '视频推荐：') {
                return
            }

            if (text) {
                contents.push({
                    type: 'text',
                    data: text
                })
            }
        })
    })


    return {
        title,
        date,
        contents
    }
}
