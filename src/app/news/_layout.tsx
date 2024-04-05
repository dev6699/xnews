import { Slot } from 'expo-router';
import { NewsContext, useNews } from '../../hooks/useNews';

export default function Layout() {
    const news = useNews()

    return (
        <NewsContext.Provider value={news}>
            <Slot />
        </NewsContext.Provider>
    )
}