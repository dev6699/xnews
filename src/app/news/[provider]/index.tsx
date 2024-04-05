import { useEffect } from 'react';
import { FlatList, Image, Text, Pressable, View, ActivityIndicator } from 'react-native';
import { Link, useGlobalSearchParams } from 'expo-router';

import { isWeb } from '../../../utils/platform';
import { useNewsContext } from '../../../hooks/useNews';

export default function NewsList() {
    const {
        state: {
            listLoading,
            newsList,
            providers,
            newsLoading
        },
        actions: {
            loadMoreNews,
            refreshNewsList,
            switchProvider,
            viewNews
        }
    } = useNewsContext()

    const { provider } = useGlobalSearchParams<{ provider: string }>()

    useEffect(() => {
        if (!provider) {
            return
        }

        switchProvider(provider)
    }, [provider])

    return (
        <View style={{ flex: 1 }}>

            <View>
                <FlatList
                    horizontal
                    data={providers}
                    renderItem={({ item, index }) => {
                        const active = provider === item;

                        return (
                            <Link
                                key={item + index}
                                style={{
                                    padding: 15
                                }}
                                href={`/news/${item}`}
                            >
                                <Text
                                    style={{
                                        color: active ? 'teal' : 'black',
                                        padding: 10,
                                        fontSize: 16
                                    }}
                                >
                                    {item.toUpperCase()}
                                </Text>
                            </Link>
                        );
                    }}
                />
            </View>

            <View style={{ flex: 1 }}>
                {(newsLoading || listLoading) &&
                    <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.1)', top: 0, bottom: 0, right: 0, left: 0 }}>
                        <ActivityIndicator size={'large'} style={{ marginVertical: 200 }} />
                    </View>
                }
                <FlatList
                    data={newsList}
                    onRefresh={refreshNewsList}
                    refreshing={listLoading}
                    ListFooterComponent={() => {
                        if (!isWeb) {
                            return null
                        }
                        return (
                            <Pressable onPress={loadMoreNews}
                                style={{
                                    marginHorizontal: 'auto',
                                    marginVertical: 20,
                                    backgroundColor: 'teal',
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 20
                                }}
                            >
                                <Text style={{ color: 'white' }}>Load More</Text>
                            </Pressable>
                        )
                    }}
                    onEndReached={() => {
                        if (isWeb) {
                            // weird behaviour in web, non-stop calling
                            return
                        }
                        loadMoreNews()
                    }
                    }
                    onEndReachedThreshold={0.5}
                    renderItem={({ item, index }) => {
                        return (
                            <Pressable
                                key={item.link}
                                onPress={() => {
                                    viewNews(item.link, index)
                                }}
                            >
                                <View
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        padding: 10,
                                        flex: 1,
                                        marginBottom: 10

                                    }}>
                                    <View style={{ flex: 1, marginRight: 10, justifyContent: 'space-between' }}>
                                        <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.title}</Text>
                                        <Text style={{ fontWeight: '400', color: 'teal', fontSize: 12 }}>{item.category}</Text>
                                        <Text style={{ color: 'gray', fontSize: 12 }}>{item.created}</Text>
                                    </View>

                                    <Image
                                        resizeMode='cover'
                                        style={{
                                            borderRadius: 20,
                                            height: 90,
                                            width: 90
                                        }}
                                        source={{ uri: item.image }}
                                    />
                                </View>
                            </Pressable>
                        )
                    }}
                />
            </View>
        </View>
    );
}