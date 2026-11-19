import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

/** Longest side sent to the server: plenty for an avatar or logo, and far below its size and dimension limits. */
export const UPLOAD_MAX_SIDE = 1024;

/**
 * Lets the user pick a photo and crop it to a square (the system cropper), then downscales and re-encodes it as a
 * JPEG so a multi-megapixel gallery photo becomes a few hundred KB. Returns the local file URI, or undefined if cancelled.
 */
export async function pickSquarePhoto(): Promise<string | undefined> {
  const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
  const asset = picked.canceled ? undefined : picked.assets[0];

  if (!asset) {
    return undefined;
  }

  // Some pickers ignore the crop request and return the full photo; the resize bounds it either way.
  const scale = asset.width >= asset.height ? { width: UPLOAD_MAX_SIDE } : { height: UPLOAD_MAX_SIDE };
  const needsResize = Math.max(asset.width, asset.height) > UPLOAD_MAX_SIDE;
  const result = await ImageManipulator.manipulateAsync(asset.uri, needsResize ? [{ resize: scale }] : [], {
    compress: 0.85,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return result.uri;
}

/**
 * Adds a photo file to a multipart form. Expo's `fetch` (the app's global one) cannot send React Native's old
 * `{ uri, name, type }` pseudo-file ("Unsupported FormDataPart implementation"); it needs a real Blob or an
 * expo-file-system `File`, which it reads itself.
 */
export async function appendPhoto(form: FormData, field: string, uri: string, fallbackName: string): Promise<void> {
  if (Platform.OS === 'web') {
    form.append(field, await (await fetch(uri)).blob(), fallbackName);
  } else {
    form.append(field, new File(uri) as unknown as Blob);
  }
}
