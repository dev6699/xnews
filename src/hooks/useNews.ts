import { useEffect, useRef, useState } from "react"
import * as Speech from 'expo-speech';

import { NewsService, BaseNews, News } from "../services/news";

export const useNews = () => {

    const providers = Object.keys(NewsService)
    const [provider, setProvider] = useState<string>(providers[0])

    const page = useRef(0)
    const [listLoading, setListLoading] = useState(false)
    const [newsLoading, setNewsLoading] = useState(false)
    const [newsList, setNewsList] = useState<BaseNews[]>([])
    const [news, setNews] = useState<{ index: number, data: News } | null>(null)
    const [speechState, setSpeechState] = useState<'idle' | 'play' | 'load-next'>('idle')
    const canRetry = useRef(false)

    const newsService = NewsService[provider]

    useEffect(() => {
        refreshNewsList()
    }, [])

    useEffect(() => {
        (async () => {
            switch (speechState) {
                case 'idle':
                    await Speech.stop()
                    break

                case 'play':
                    if (!news) {
                        return
                    }
                    const { title, contents } = news.data
                    let text = `${title}`
                    for (const c of contents) {
                        if (c.type === 'text' || c.type === 'subtitle') {
                            text += ` ${c.data}`
                        }
                    }

                    startSpeech(text)
                    break

                case 'load-next':
                    await viewNextNews()
                    setSpeechState('play')
                    break
            }
        })()

    }, [speechState])

    const startSpeech = (text: string) => {
        const max = Speech.maxSpeechInputLength
        const textParts = text.split(' ')

        let currentText = ''
        let remainingText = ''
        let currentLength = 0

        for (const p of textParts) {
            if (currentLength + p.length <= max && remainingText === '') {
                currentLength += p.length
                currentText += ' ' + p
            } else {
                remainingText += ' ' + p
            }
        }

        Speech.speak(currentText, {
            language: newsService.language,
            onDone: () => {
                if (remainingText) {
                    startSpeech(remainingText)
                } else {
                    setSpeechState('load-next')
                }
            },
        })
    }

    const refreshNewsList = async () => {
        page.current = -1
        loadMoreNews()
    }

    const loadMoreNews = async () => {
        page.current = page.current + 1
        setListLoading(true)
        try {
            const list = await newsService.list(page.current)
            setNewsList(list)
            setListLoading(false)
        } catch (err) {
            console.error(err)
            await sleep(1)
            if (canRetry.current) {
                page.current = page.current - 1
                await loadMoreNews()
            } else {
                setListLoading(false)
            }
        }
    }

    const switchProvider = async (provider: string) => {
        setProvider(provider)
        page.current = 0
        setListLoading(true)
        const list = await NewsService[provider].list(page.current)
        setNewsList(list)
        setListLoading(false)
    }

    const viewNews = async (link: string, index: number) => {
        if (!canRetry.current) {
            canRetry.current = true
        }
        setNewsLoading(true)
        try {
            const data = await newsService.view(link)
            setNews({ index, data })
            setNewsLoading(false)
        } catch (err) {
            console.error(err)
            await sleep(1)
            if (canRetry.current) {
                await viewNews(link, index)
            } else {
                setNewsLoading(false)
            }
        }
    }

    const viewPreviousNews = async () => {
        if (!news) {
            return
        }
        setSpeechState('idle')
        const previousIdx = news.index - 1
        await viewNews(newsList[previousIdx].link, previousIdx)
    }

    const viewNextNews = async () => {
        if (!news) {
            return
        }
        setSpeechState('idle')
        const nextIdx = news.index + 1
        if (nextIdx >= newsList.length) {
            await loadMoreNews()
        }
        await viewNews(newsList[nextIdx].link, nextIdx)
    }

    const closeNews = async () => {
        canRetry.current = false
        setSpeechState('idle')
        setNews(null);
    }

    const toggleSpeech = () => {
        if (speechState === 'load-next') {
            return
        } else if (speechState === 'play') {
            setSpeechState('idle')
        } else {
            setSpeechState('play')
        }
    }


    return {
        actions: {
            switchProvider,
            refreshNewsList,
            loadMoreNews,
            viewNews,
            viewPreviousNews,
            viewNextNews,
            closeNews,
            toggleSpeech,
        },
        state: {
            providers,
            provider,
            newsList,
            newsLoading,
            listLoading,
            news,
            speechState,
        }
    }
}

const sleep = async (time: number) => {
    await new Promise((res) => {
        setTimeout(() => {
            res(true)
        }, time * 1000)
    })
}