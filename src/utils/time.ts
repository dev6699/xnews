export const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const timeDifference = now - timestamp;

    if (timeDifference < 60000) {
        const seconds = Math.floor(timeDifference / 1000);
        return `${seconds}s ago`;
    } else if (timeDifference < 3600000) {
        const minutes = Math.floor(timeDifference / 60000);
        return `${minutes}m ago`;
    } else if (timeDifference < 86400000) {
        const hours = Math.floor(timeDifference / 3600000);
        return `${hours}h ago`;
    } else {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }
}