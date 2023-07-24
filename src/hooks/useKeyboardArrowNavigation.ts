import { useEffect } from 'react';
import { isWeb } from '../utils/platform';

export const useKeyboardArrowNavigation = (
    onLeftPress: () => void,
    onRightPress: () => void
) => {

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            onLeftPress();
        } else if (event.key === 'ArrowRight') {
            onRightPress();
        }
    };

    useEffect(() => {
        if (!isWeb) {
            return
        }
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onLeftPress, onRightPress]);

};
