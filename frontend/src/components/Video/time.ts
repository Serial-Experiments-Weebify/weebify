export function secondsToHMS(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    const secs = Math.floor(seconds % 60);

    const hoursStr = hours > 0 ? `${hours}:` : '';

    const minutesStr = `${minutes < 10 || hours > 0 ? '0' : ''}${minutes}:`;

    const secondsStr = secs < 10 ? `0${secs}` : `${secs}`;

    return hoursStr + minutesStr + secondsStr;
}
