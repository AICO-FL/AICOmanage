/**
 * 分単位のダウンタイムを時間と分の形式に変換する
 * @param minutes ダウンタイム（分）
 * @returns フォーマットされた文字列（例: "2時間30分"）
 */
export function formatDowntime(minutes: number): string {
  if (minutes === 0) return '0分';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}分`;
  }

  if (remainingMinutes === 0) {
    return `${hours}時間`;
  }

  return `${hours}時間${remainingMinutes}分`;
}