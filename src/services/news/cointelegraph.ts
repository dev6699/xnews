import { load } from 'cheerio';

import { getTimeAgo } from '../../utils/time';
import { BaseNews, Content, TNewsProvider } from './types';
import { proxify, request } from './_proxy';

const BASE_URl = proxify("https://cointelegraph.com")

type CointelegraphResponse = {
  data: {
    locale: {
      category: {
        id: string
        posts: {
          data: Post[]
          postsCount: number
        }
      }
    }
  }
}

type Post = {
  id: string
  slug: string
  postTranslate: {
    id: string
    title: string
    avatar: string
    published?: string
    publishedHumanFormat?: string
  }
}


export const list: TNewsProvider['list'] = async (page = 0) => {
  const lists: BaseNews[] = []
  const offset = page * 10
  const body = {
    operationName: "CategoryPagePostsQuery",
    query: QUERY,
    variables: {
      cacheTimeInMS: 300_000,
      hideFromMainPage: false,
      length: 10,
      offset,
      short: "en",
      slug: "latest-news",
    },
  }

  const data = await request(`${BASE_URl}/v1/`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Accept:
        "application/graphql-response+json, application/graphql+json, application/json",
      "Accept-Language": "en-US,en;q=0.8",
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Pragma: "no-cache",
      Referer: "https://cointelegraph.com/",
      Origin: "https://cointelegraph.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0.0.0",
    },
  }).then(r => r.json()) as CointelegraphResponse;

  for (const d of data.data.locale.category.posts.data) {
    const date = new Date(d.postTranslate.published!)

    lists.push({
      image: d.postTranslate.avatar,
      link: `news/${d.slug}`,
      nid: d.id,
      title: d.postTranslate.title,
      category: '',
      created: getTimeAgo(date.getTime())
    })
  }

  return lists
}

export const view: TNewsProvider['view'] = async (link) => {
  const data = await request(`${BASE_URl}/${link}`).then(r => r.text());

  const $ = load(data)
  const title = $('[data-testid="post-title"]').first().text().trim()
  const publicationDate = $('[data-testid="publish-date"]')
    .attr('datetime')!

  const contents: Content[] = []

  $("article")
    .first()
    .children('figure')
    .each((_, el) => {
      const uri = $(el).find('img').attr("src")
      if (!uri) {
        return
      }
      contents.push({
        type: 'image',
        uri,
        caption: $(el).find('figcaption').text()!,
      })
    })

  $('[data-testid="html-renderer-container"]')
    .children('p, h2, figure').each((_, el) => {
      const tag = el.tagName.toLowerCase()

      if (tag === "figure") {
        const uri = $(el).find('img').attr("src")
        if (!uri) {
          return
        }
        contents.push({
          type: 'image',
          uri,
          caption: $(el).find('figcaption').text()!,
        })
        return
      }

      const text = $(el).text().trim()
      if (text) {
        if (tag === "p") {
          contents.push({
            type: 'text',
            data: text
          })
        } else {
          contents.push({
            type: 'subtitle',
            data: text
          })
        }
      }
    })

  return {
    title,
    date: getTimeAgo(new Date(publicationDate).getTime()),
    contents: contents,
  }
}

export const language: TNewsProvider['language'] = 'en'

export const QUERY = `
query CategoryPagePostsQuery(
  $short: String,
  $slug: String!,
  $offset: Int = 0,
  $length: Int = 10,
  $hideFromMainPage: Boolean = null
) {
  locale(short: $short) {
    category(slug: $slug) {
      id
      posts(
        order: "postPublishedTime"
        offset: $offset
        length: $length
        hideFromMainPage: $hideFromMainPage
      ) {
        data {
          id
          slug
          views
          postTranslate {
            id
            title
            avatar
            published
            publishedHumanFormat
            leadText
            author {
              id
              slug
              innovationCircleUrl
              authorTranslates {
                id
                name
              }
            }
          }
          category {
            id
            slug
            categoryTranslates {
              id
              title
            }
          }
          author {
            id
            slug
            authorTranslates {
              id
              name
            }
          }
          postBadge {
            id
            label
            postBadgeTranslates {
              id
              title
            }
          }
          showShares
          showStats
        }
        postsCount
      }
    }
  }
}`;
