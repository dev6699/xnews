import { useEffect } from 'react';

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
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onLeftPress, onRightPress]);

};
