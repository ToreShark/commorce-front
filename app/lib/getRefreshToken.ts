
import { serialize, parse } from 'cookie';

export function setCookie(name: string, value: string, options?: any) {
  const cookieString = serialize(name, value, options);
  document.cookie = cookieString;
}

export function getCookie(name: string): string | undefined {
  const cookies = parse(document.cookie);
  console.log('cookies', cookies);
  return cookies[name];
}