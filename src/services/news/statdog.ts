import axios from 'axios';
import { load } from 'cheerio';
import { BaseNews, Content, TNewsProvider } from './types';

const BASE_URl = "https://statementdog.com"

let lists: BaseNews[] = []

export const list: TNewsProvider['list'] = async (page = 0) => {
    if (page === 0 && lists.length) {
        lists = []
    }
    const { data } = await axios.get(`${BASE_URl}/news?page=${page + 1}`);

    const $ = load(data)
    $('.statementdog-news-list-item').each((_, el) => {
        const image = $(el).find('img').attr('src')!

        const title = $(el).find('.statementdog-news-list-item-title').text()
        const created = $(el).find('.statementdog-news-list-item-date').text()
        const link = $(el).find('.statementdog-news-list-item-content').find('a').attr('href')!
        const category: string[] = []
        $(el).find('.statementdog-news-list-item-tag-list-item').each((_, cel) => {
            category.push($(cel).text().replaceAll('\n', '').replaceAll('\t', ''))
        })
        lists.push({
            link: link,
            nid: link,
            title: title.replaceAll('\n', '').replaceAll('\t', ''),
            image: image,
            category: category.join(' | '),
            created: created.replaceAll('\n', '').replaceAll('\t', '')
        })
    })

    return lists
}

export const view: TNewsProvider['view'] = async (link: string) => {
    const { data } = await axios.get(link)

    const $ = load(data)

    const title = $('.main-news-title').text()
    const date = $('.main-news-time').text().split('：')[1]
    const img = $('picture > img').attr('src')!

    const contents: Content[] = [
        { type: 'image', uri: img, caption: '' }
    ]

    let omitRest = false
    $('.main-news-content > h2, p').each((_, el) => {
        if (omitRest) {
            return
        }

        if (el.tagName === 'h2') {
            if ($(el).text() === '概念股') {
                omitRest = true
                return
            }
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
        title,
        date,
        contents
    }
}

export const language: TNewsProvider['language'] = 'zh'