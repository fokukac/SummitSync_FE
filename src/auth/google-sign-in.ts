import { GoogleSignin, isCancelledResponse } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

/**
 * The OAuth *web* client id of the Google Cloud project (the same one the website uses; public by design). The
 * native sign-in needs it to be allowed to hand back an access token for the backend to verify.
 */
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/** Native Google sign-in exists on Android only (for now), and only when the build knows the client id. */
export const googleSignInAvailable = Platform.OS === 'android' && Boolean(WEB_CLIENT_ID);

let configured = false;

/**
 * Asks Google for an access token through the account picker. Returns null when the user dismissed it; throws
 * when something went wrong (no Play Services, no network, the app's signing key not registered in Google Cloud).
 */
export async function requestGoogleAccessToken(): Promise<string | null> {
  if (!configured) {
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, offlineAccess: false });
    configured = true;
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();

  if (isCancelledResponse(response)) {
    return null;
  }

  const { accessToken } = await GoogleSignin.getTokens();

  if (!accessToken) {
    throw new Error('Google returned no access token.');
  }

  return accessToken;
}

/** Forget the Google account on this device so the next sign-in shows the picker again. */
export async function forgetGoogleAccount(): Promise<void> {
  if (!googleSignInAvailable) {
    return;
  }

  await GoogleSignin.signOut().catch(() => undefined);
}
