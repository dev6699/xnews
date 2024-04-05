import { createContext, useContext, useEffect, useRef, useState } from "react"
import * as Speech from 'expo-speech';
import { router } from "expo-router";

import { toBase64 } from "../utils/encode";
import { NewsService, BaseNews, News } from "../services/news";

export type TNewsContext = ReturnType<typeof useNews>
export const NewsContext = createContext<TNewsContext>({} as TNewsContext);
export const useNewsContext = () => useContext(NewsContext);

export const useNews = () => {

    const providers = Object.keys(NewsService)
    const [provider, setProvider] = useState<string>(providers[0])
    const providerRef = useRef('')
    const page = useRef(0)
    const [listLoading, setListLoading] = useState(false)
    const [newsLoading, setNewsLoading] = useState(false)
    const [newsList, setNewsList] = useState<BaseNews[]>([])
    const [news, setNews] = useState<{ index: number, data: News } | null>(null)
    const [speechState, setSpeechState] = useState<'idle' | 'play' | 'load-next'>('idle')
    const canRetry = useRef(false)


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
            language: NewsService[providerRef.current].language,
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
            const list = await NewsService[providerRef.current].list(page.current)
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
        if (providerRef.current === provider) {
            return
        }
        providerRef.current = provider
        setProvider(provider)
        page.current = 0
        setListLoading(true)
        const list = await NewsService[provider].list(page.current)
        setNewsList(list)
        setListLoading(false)
        setNewsLoading(false)
    }

    const viewNews = async (link: string, index: number) => {
        if (!canRetry.current) {
            canRetry.current = true
        }
        const p = providerRef.current
        setNewsLoading(true)

        try {
            const data = await NewsService[p].view(link)
            if (providerRef.current === p) {
                setNews({ index, data })
                router.push(`/news/${p}/${toBase64(link)}?index=${index}`);
            }
            setNewsLoading(false)
        } catch (err) {
            console.error(err)
            await sleep(1)
            if (canRetry.current && providerRef.current === p) {
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
        if (previousIdx < 0) {
            return
        }
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
        setTimeout(res, time * 1000)
    })
}