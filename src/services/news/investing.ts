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

    $('.largeTitle > article').each((_, el) => {
        const isSponsor = $(el).find('.sponsoredBadge').html()
        if (isSponsor !== null) {
            return
        }
        const isPro = $(el).find('div > p > .pro-title-list-icon').html()
        if (isPro !== null) {
            return
        }
        const link = `${BASE_URl}${$(el).find('.title').attr('href')}`.split(BASE_URl)[1]
        const title = $(el).find('.title').text()
        if (!title) {
            return
        }
        lists.push({
            link,
            nid: link,
            title,
            image: $(el).find('img').attr('data-src')!,
            category: '',
            created: $(el).find('.date').text().split(' - ')[1]
        })
    })
    return lists
}

export const view: TNewsProvider['view'] = async (link) => {
    const data = await request(`${BASE_URl}/${link}`).then(r => r.text());

    const $ = load(data)
    const contents: Content[] = [
        { type: 'image', uri: $('#carouselImage').attr('src')!, caption: '' }
    ]

    $('.articlePage > p, h2').each((_, el) => {
        const text = $(el).text()
        if (text === '' || text === 'Related Articles') {
            return
        }
        if (el.tagName === 'h2') {
            contents.push(
                {
                    type: 'subtitle',
                    data: text
                }
            )
        } else {
            contents.push(
                {
                    type: 'text',
                    data: text
                }
            )
        }
    })

    const published = $('.contentSectionDetails > span:first-child').text().replace('Published ', '').replace(' ET', '')
    const updated = $('.contentSectionDetails > span:nth-child(2)').text().replace('Updated ', '').replace(' ET', '')

    return {
        title: $('title').text(),
        date: getTimeAgo(dateStringToTimestamp(updated || published)),
        contents: contents,
    }
}

export const language: TNewsProvider['language'] = 'en'
