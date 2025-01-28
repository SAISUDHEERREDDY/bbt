export function detectIsTv(userAgent = '') {
  let ua: string = userAgent;
  if (ua.length === 0) {
    ua = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  }

  return ua.indexOf('SmartTV') > -1;
}
