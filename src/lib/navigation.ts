import { type Href, router } from 'expo-router';

/** Goes back when there is somewhere to go back to (a deep link opens a screen with no history), else to `fallback`. */
export function goBackOr(fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
