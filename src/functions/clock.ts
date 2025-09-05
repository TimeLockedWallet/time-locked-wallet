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

export function fromDuration(time: number) {
  if (time < 0) time = 0;

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;

  let ntime = time;

  const sday = Math.floor(ntime / day);
  ntime = ntime % day;

  const shour = Math.floor(ntime / hour);
  ntime = ntime % hour;

  const sminute = Math.floor(ntime / minute);
  ntime = ntime % minute;

  return String(sday) + "d:" + String(shour) + "h:" + String(sminute) + "m:" + String(ntime) + "s";
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
