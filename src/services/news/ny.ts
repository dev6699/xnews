import axios from 'axios';
import { load } from 'cheerio';
import { getTimeAgo } from '../../utils/time';
import { BaseNews, Content, TNewsProvider } from './types';
import { proxify } from './_proxy';

const BASE_URl = proxify("https://www.enanyang.my")

type NewsList = {
    title: string
    channel: string
    link: string
    clink: string
    nid: number
    created: string
    teaser_image: string
}

let lists: BaseNews[] = []

export const list: TNewsProvider['list'] = async (page = 0) => {
    if (page === 0 && lists.length) {
        lists = []
    }
    const { data } = await axios.get(`${BASE_URl}/api/get/home/articles?page=${page}`);

    for (const d of (data as NewsList[])) {
        lists.push({
            link: d.link,
            nid: `${d.nid}`,
            title: d.title,
            image: `${BASE_URl}/${d.teaser_image}`,
            category: d.channel,
            created: getTimeAgo(+d.created * 1000)
        })
    }

    return lists
}

export const view: TNewsProvider['view'] = async (link: string) => {
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

export const language: TNewsProvider['language'] = 'zh'