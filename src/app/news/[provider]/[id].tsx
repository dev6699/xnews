import { useEffect } from 'react';
import { router, useLocalSearchParams, } from 'expo-router';
import { ActivityIndicator, Image, Modal, ScrollView, Text, Pressable, View } from 'react-native';

import { fromBase64 } from '../../../utils/encode';
import { useNewsContext } from '../../../hooks/useNews';
import { useKeyboardArrowNavigation } from '../../../hooks/useKeyboardArrowNavigation';

export default function News() {
    const params = useLocalSearchParams<{ id: string, index: string, provider: string }>()
    const {
        state: {
            news,
            newsLoading,
            provider,
            speechState
        },
        actions: {
            switchProvider,
            closeNews,
            toggleSpeech,
            viewNews,
            viewNextNews,
            viewPreviousNews
        }
    } = useNewsContext()


    useEffect(() => {
        if (news) {
            return
        }

        (async () => {
            if (!params.id || params.index === undefined || !params.provider) {
                return
            }
            await switchProvider(params.provider)
            await viewNews(fromBase64(params.id), +params.index)
        })()
    }, [news, params])

    useKeyboardArrowNavigation(
        () => { viewPreviousNews() },
        () => { viewNextNews() },
    )

    const backNewsList = () => {
        closeNews()
        router.replace(`/news/${provider}`);
    }

    if (!news || newsLoading) {
        return (
            <View style={{ flex: 1 }}>
                <ActivityIndicator size={'large'}
                    style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.1)', top: 0, bottom: 0, right: 0, left: 0, zIndex: 999 }}
                />
            </View>
        )
    }

    return (
        <Modal
            animationType="fade"
            visible={true}
            onRequestClose={backNewsList}>
            <View style={{ paddingHorizontal: 20, paddingTop: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ paddingRight: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Text style={{ fontSize: 24, fontWeight: '600' }} >{news.data.title}</Text>
                    <Text style={{ fontSize: 20 }}>{news.data.date}</Text>
                </View>
                <Pressable onPress={backNewsList} style={{ paddingHorizontal: 10, paddingVertical: 5 }}><Text style={{ fontSize: 30 }}>X</Text></Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, flex: 0 }}>
                {
                    news.data.contents.map((c, i) => {
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
                                <Text key={i} style={{ fontWeight: 'bold', fontSize: 24, marginTop: 10 }}>{c.data}</Text>
                            )
                        }

                        return (
                            <Text key={i} style={{ paddingVertical: 5, fontSize: 20, textAlign: 'justify' }}>{c.data}</Text>
                        )
                    })
                }
            </ScrollView>

            <View
                style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                <Pressable
                    style={{
                        height: 50,
                        width: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    disabled={news.index === 0}
                    onPress={viewPreviousNews}
                >
                    <Text style={{ fontSize: 20, color: 'teal' }}>{'<'}</Text>
                </Pressable>
                <Pressable
                    disabled={speechState === 'load-next'}
                    onPress={toggleSpeech}
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
                </Pressable>
                <Pressable
                    style={{
                        height: 50,
                        width: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={viewNextNews}
                >
                    <Text style={{ fontSize: 20, color: 'teal' }}>{'>'}</Text>
                </Pressable>
            </View>
        </Modal>
    );
}