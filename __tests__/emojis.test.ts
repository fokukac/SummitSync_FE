import { EMOJI_CATEGORIES } from '@/constants/emojis';
import { insertAt, isEmojiOnly, rememberEmoji, RECENT_EMOJIS_MAX } from '@/lib/emojis';

describe('isEmojiOnly', () => {
  it('is true for one to three emojis, with or without spaces', () => {
    expect(isEmojiOnly('👍')).toBe(true);
    expect(isEmojiOnly('🔥 🔥 🔥')).toBe(true);
    expect(isEmojiOnly('🏔️🥾')).toBe(true);
  });

  it('counts a skin-tone or joined sequence as one emoji', () => {
    expect(isEmojiOnly('👍🏽')).toBe(true);
    expect(isEmojiOnly('👨‍👩‍👧👍🔥')).toBe(true);
  });

  it('is false for text, for mixed messages and for more than three emojis', () => {
    expect(isEmojiOnly('')).toBe(false);
    expect(isEmojiOnly('ok 👍')).toBe(false);
    expect(isEmojiOnly('👍👍👍👍')).toBe(false);
  });
});

describe('emoji set', () => {
  it('has the website categories with real emojis in them', () => {
    expect(EMOJI_CATEGORIES.map((category) => category.key)).toEqual(['smileys', 'gestures', 'hearts', 'outdoors', 'activities', 'food']);
    expect(EMOJI_CATEGORIES.every((category) => category.emojis.length > 5)).toBe(true);
  });
});

describe('rememberEmoji', () => {
  it('puts the newest first and drops a repeat', () => {
    expect(rememberEmoji(['👍', '🔥'], '🔥')).toEqual(['🔥', '👍']);
  });

  it('keeps at most the limit', () => {
    const many = Array.from({ length: RECENT_EMOJIS_MAX }, (_, i) => `e${i}`);

    expect(rememberEmoji(many, '🎉')).toHaveLength(RECENT_EMOJIS_MAX);
    expect(rememberEmoji(many, '🎉')[0]).toBe('🎉');
  });
});

describe('insertAt', () => {
  it('inserts at the caret and moves the caret after it', () => {
    expect(insertAt('hello world', { start: 5, end: 5 }, '👍')).toEqual({ text: 'hello👍 world', caret: 7 });
  });

  it('replaces a selection', () => {
    expect(insertAt('hello world', { start: 6, end: 11 }, '🏔️')).toEqual({ text: 'hello 🏔️', caret: 6 + '🏔️'.length });
  });
});
