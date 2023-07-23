import { ActivityIndicator, FlatList, Image, Modal, SafeAreaView, ScrollView, StatusBar, Text, Pressable, View } from 'react-native';
import { useNews } from './src/hooks/useNews';
import { isWeb } from './src/utils/platform';

export default function App() {
  const {
    state: {
      provider,
      providers,
      listLoading,
      newsLoading,
      newsList,
      news,
      speechState,
    },
    actions: {
      switchProvider,
      refreshNewsList,
      loadMoreNews,
      viewNews,
      viewNextNews,
      viewPreviousNews,
      closeNews,
      toggleSpeech
    }
  } = useNews()

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
        horizontal
        data={providers}
        renderItem={({ item, index }) => {
          const active = provider === item;
          return (
            <Pressable
              key={item + index}
              onPress={() => switchProvider(item)}
              style={{
                paddingHorizontal: 15,
              }}
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
            </Pressable>
          );
        }}
      />

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
              onPress={() => {
                viewNews(item.link, index)
              }}
            >
              <View
                key={item.nid}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  marginBottom: 10
                }}
              >
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

      {listLoading && <ActivityIndicator size={'large'} />}

      <Modal
        animationType="slide"
        visible={!!news}
        onRequestClose={closeNews}>
        {newsLoading &&
          <ActivityIndicator size={'large'}
            style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.1)', top: 0, bottom: 0, right: 0, left: 0, zIndex: 999 }}
          />
        }
        <View style={{ paddingHorizontal: 20, paddingTop: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ paddingRight: isWeb ? 20 : 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '600' }} >{news?.data.title}</Text>
            <Text style={{ fontSize: 20 }}>{news?.data.date}</Text>
          </View>

          {isWeb &&
            <Pressable onPress={closeNews}><Text style={{ fontSize: 30 }}>X</Text></Pressable>
          }
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
                  <Text key={i} style={{ fontWeight: 'bold', fontSize: 24, marginTop: 10 }}>{c.data}</Text>
                )
              }

              return (
                <Text key={i} style={{ paddingVertical: 5, fontSize: 20 }}>{c.data}</Text>
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
        }
      </Modal>
    </SafeAreaView>
  );
}