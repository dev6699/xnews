export type BaseNews = {
    title: string
    link: string
    nid: string
    image: string
    created: string
    category: string
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
export type Content = ImageContent | SubtitleContent | TextContent

export type News = {
    title: string
    date: string
    contents: Content[]
}

export type TNewsProvider = {
    language: 'en' | 'zh'
    list(page?: number): Promise<BaseNews[]>
    view: (link: string) => Promise<News>
}