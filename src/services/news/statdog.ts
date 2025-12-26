import { load } from 'cheerio';
import { BaseNews, Content, TNewsProvider } from './types';
import { proxify, request } from './_proxy';

const base_url = "https://statementdog.com"
const BASE_URl = proxify(base_url)


export const list: TNewsProvider['list'] = async (page = 0) => {
    const lists: BaseNews[] = []
    const data = await request(`${BASE_URl}/news?page=${page + 1}`).then(r => r.text());

    const $ = load(data)
    $('.statementdog-news-list-item').each((_, el) => {
        const image = $(el).find('img').attr('src')!

        let title = $(el).find('.statementdog-news-list-item-title').text()
        title = title.replaceAll(" ", "")
        let created = $(el).find('.statementdog-news-list-item-date').text()
        created = created.replaceAll(" ", "")
        const link = $(el).find('.statementdog-news-list-item-content').find('a').attr('href')!
        const category: string[] = []
        $(el).find('.statementdog-news-list-item-tag-list-item').each((_, cel) => {
            category.push($(cel).text().replaceAll('\n', '').replaceAll('\t', '').replaceAll(" ", ""))
        })
        lists.push({
            link: link.replace(base_url, ''),
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
    const data = await request(`${BASE_URl}/${link}`).then(r => r.text());

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