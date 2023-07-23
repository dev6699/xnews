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

// "Jul 23, 2023 09:42AM"
export const dateStringToTimestamp = (dateString: string) => {
    const months: { [key: string]: number } = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    const dateRegex = /^(\w{3}) (\d{1,2}), (\d{4}) (\d{1,2}):(\d{2})(AM|PM)$/;

    const [, monthStr, day, year, hour, minute, ampm] = dateString.match(dateRegex) || [];

    if (!monthStr || !day || !year || !hour || !minute || !ampm) {
        throw new Error("Invalid date format");
    }

    const month = months[monthStr];
    const isPM = ampm === "PM" || ampm === "pm";

    let hour24 = parseInt(hour, 10);
    if (isPM && hour24 !== 12) {
        hour24 += 12;
    } else if (!isPM && hour24 === 12) {
        hour24 = 0;
    }

    const date = new Date(parseInt(year, 10), month, parseInt(day, 10), hour24, parseInt(minute, 10));
    let timestamp = date.getTime();

    // Add 12 hours in milliseconds
    const eightHoursInMilliseconds = 12 * 60 * 60 * 1000;
    timestamp += eightHoursInMilliseconds;

    return timestamp;
}
