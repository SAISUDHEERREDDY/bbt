import { I18nState } from './state';

/**
 * Get a cookie given a name
 * @param cname
 */
function getCookie(cname: string) {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document?.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  return '';
}

const code = getCookie('language');
export const initialI18nState: I18nState = {
  global: { code: code ? code : 'en' }
};
