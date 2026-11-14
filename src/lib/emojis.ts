/**
 * Chat emoji helpers (the set itself is in src/constants/emojis.ts, copied from the website). Emojis are plain text in
 * a message body: no images, and each phone draws them with its own system font.
 */

/**
 * One emoji as a regex: a pictograph with an optional skin tone or variation selector, joined by zero-width joiners
 * into sequences (a family, a person with a profession). Built defensively: a JavaScript engine without Unicode
 * property escapes just never recognises emoji-only messages, and everything else keeps working.
 */
const EMOJI = (() => {
  try {
    return new RegExp('\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})?(?:\\u200D\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})?)*', 'gu');
  } catch {
    return null;
  }
})();

/** True for a message made of at most three emojis and nothing else: those are shown big, without surrounding text. */
export function isEmojiOnly(body: string): boolean {
  const text = body.trim();

  if (text === '' || text.length > 30 || EMOJI === null) {
    return false;
  }

  const found = text.match(EMOJI) ?? [];

  return found.length >= 1 && found.length <= 3 && text.replace(EMOJI, '').replace(/\s+/g, '') === '';
}

export const RECENT_EMOJIS_MAX = 16;

/** The emoji just picked goes to the front of the recent list, without a duplicate, capped at `RECENT_EMOJIS_MAX`. */
export function rememberEmoji(recent: string[], emoji: string): string[] {
  return [emoji, ...recent.filter((existing) => existing !== emoji)].slice(0, RECENT_EMOJIS_MAX);
}

/** Inserts `emoji` where the caret is (replacing any selection) and says where the caret goes afterwards. */
export function insertAt(text: string, selection: { start: number; end: number }, emoji: string): { text: string; caret: number } {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);

  return { text: text.slice(0, start) + emoji + text.slice(end), caret: start + emoji.length };
}
