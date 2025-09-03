export function toTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): number {
  return new Date(year, month - 1, day, hour, minute, second).getTime();
}

export function fromTimestamp(timestamp: number) {
  const date = new Date(timestamp);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
}

export function formatTime(data: any) {
  let result = "";
  result += (String(data.day).length < 2 ? "0" : "") + String(data.day) + '/';
  result += (String(data.month).length < 2 ? "0" : "") + String(data.month) + '/';
  result += String(data.year) + ' ';
  result += (String(data.hour).length < 2 ? "0" : "") + String(data.hour) + ':';
  result += (String(data.minute).length < 2 ? "0" : "") + String(data.minute) + ':';
  result += (String(data.second).length < 2 ? "0" : "") + String(data.second);
  return result;
}

console.log(fromTimestamp(toTimestamp(2025, 9, 1, 22, 30, 0)));
