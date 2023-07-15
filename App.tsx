import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { News, NewsList, list, view } from './src/services/news/ny';
import * as Speech from 'expo-speech';

export default function App() {
  const [listLoading, setListLoading] = useState(false)
  const [newsLoading, setNewsLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [newsList, setNewsList] = useState<NewsList[]>([])
  const [news, setNews] = useState<{ index: number, data: News } | null>(null)
  const [speechState, setSpeechState] = useState<'idle' | 'play' | 'load-next'>('idle')

  useEffect(() => {
    (async () => {
      setListLoading(true)
      const n = await list(page)
      setNewsList(n)
      setListLoading(false)
    })()
  }, [page])

  useEffect(() => {
    if (!news) {
      return
    }

    if (news.index + 5 > newsList.length) {
      setPage(page + 1)
    }
  }, [news])

  useEffect(() => {
    let cancelled = false
    if (!news) {
      return
    }

    (async () => {

      switch (speechState) {
        case 'idle':
          await Speech.stop()
          break

        case 'play':
          startSpeech(news.data, news.index)
          break

        case 'load-next':
          const nextIndex = news.index + 1
          const nextNews = newsList[nextIndex]
          const n = await view(nextNews.link)
          if (cancelled) {
            return
          }
          setNews({ index: nextIndex, data: n })
          setSpeechState('play')
          break
      }
    })()

    return () => {
      cancelled = true
    }
  }, [speechState])

  const startSpeech = (newsSpeech: News, index: number) => {
    const { title, date, contents } = newsSpeech
    let text = `${title} ${date}`
    for (const c of contents) {
      if (c.type === 'text' || c.type === 'subtitle') {
        text += ` ${c.data}`
      }
    }
    // text = `${index}`
    Speech.speak(text, {
      language: 'zh',
      onDone: () => {
        setSpeechState('load-next')
      },
    })
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        position: 'relative'
      }}
    >
      {newsLoading &&
        <ActivityIndicator size={'large'}
          style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.1)', top: 0, bottom: 0, right: 0, left: 0 }}
        />
      }
      <StatusBar backgroundColor={'teal'} />
      <FlatList
        data={newsList}
        onRefresh={() => {
          setPage(0)
        }}
        refreshing={listLoading}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              onPress={async () => {
                if (newsLoading) {
                  return
                }
                setNewsLoading(true)
                const n = await view(item.link)
                setNews({ index, data: n })
                setNewsLoading(false)
              }}
            >
              <View key={item.nid}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  marginBottom: 10
                }}>
                <View style={{ flex: 1, marginRight: 10, justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '600' }}>{item.title}</Text>
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <Text style={{ color: 'gray' }}>{item.created}</Text>
                    <Text style={{ marginLeft: 10, fontWeight: '400', color: 'teal' }}>{item.channel}</Text>
                  </View>
                </View>

                <Image
                  resizeMode='cover'
                  style={{
                    borderRadius: 20,
                    height: 90,
                    width: 90
                  }}
                  source={{ uri: item.teaser_image }}
                />
              </View>

            </TouchableOpacity>
          )
        }}
        onEndReached={() => {
          setPage(page + 1)
        }}
      />
      {listLoading && <ActivityIndicator size={'large'} />}

      <Modal
        animationType="slide"
        visible={!!news}
        style={{ position: 'relative' }}
        onRequestClose={async () => {
          setSpeechState('idle')
          await Speech.stop()
          setNews(null);
        }}>
        {newsLoading &&
          <ActivityIndicator size={'large'}
            style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.1)', top: 0, bottom: 0, right: 0, left: 0, zIndex: 999 }}
          />
        }
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: '600' }} >{news?.data.title}</Text>
          <Text>{news?.data.date}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {
            news?.data.contents.map((c, i) => {
              if (c.type === 'image') {
                return (
                  <View key={i} style={{ marginVertical: 10 }}>
                    <Image source={{ uri: c.uri }}
                      resizeMode='contain'
                      style={{
                        height: 300,
                        width: '100%'
                      }}
                    />
                    <Text style={{ fontStyle: 'italic' }}>{c.caption}</Text>
                  </View>
                )
              }

              if (c.type === 'subtitle') {
                return (
                  <Text key={i} style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10 }}>{c.data}</Text>
                )
              }

              return (
                <Text key={i} style={{ paddingVertical: 5 }}>{c.data}</Text>
              )
            })
          }
        </ScrollView>

        {news &&
          <View
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{
                height: 50,
                width: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={news.index === 0}
              onPress={async () => {
                setSpeechState('idle')
                setNewsLoading(true)
                const n = await view(newsList[news.index - 1].link)
                setNewsLoading(false)
                setNews({ index: news.index - 1, data: n })
              }}
            >
              <Text style={{ fontSize: 20, color: 'teal' }}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={speechState === 'load-next'}
              onPress={async () => {
                if (speechState === 'load-next') {
                  return
                } else if (speechState === 'play') {
                  setSpeechState('idle')
                } else {
                  setSpeechState('play')
                }
              }}
              style={{
                height: 50,
                width: 50,
                borderRadius: 99,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {
                speechState === 'play' ?
                  <Text style={{ color: 'teal', fontSize: 30, top: -5 }}>◼</Text>
                  :
                  speechState === 'idle' ?
                    <Text style={{ color: 'teal', fontSize: 16 }}>▶</Text>
                    :
                    <ActivityIndicator />
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 50,
                width: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={async () => {
                setSpeechState('idle')
                setNewsLoading(true)
                const n = await view(newsList[news.index + 1].link)
                setNewsLoading(false)
                setNews({ index: news.index + 1, data: n })
              }}
            >
              <Text style={{ fontSize: 20, color: 'teal' }}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        }
      </Modal>
    </SafeAreaView>
  );
}