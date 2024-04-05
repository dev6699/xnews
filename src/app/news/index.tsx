import { Redirect } from 'expo-router';
import { useNewsContext } from '../../hooks/useNews';

export default function NewsIndex() {
    const { state: { provider } } = useNewsContext()

    return (
        <Redirect href={`/news/${provider}`} />
    )
}