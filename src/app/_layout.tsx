import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Layout() {

    return (
        <SafeAreaView
            style={{
                flex: 1,
                position: 'relative',
            }}
        >
            <StatusBar backgroundColor='teal' style='light' />
            <Slot />
        </SafeAreaView>
    )
}