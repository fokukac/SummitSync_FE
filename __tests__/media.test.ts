import { resolveMediaUrl } from '@/lib/media';

describe('resolveMediaUrl', () => {
  it('puts backend paths on the API host', () => {
    expect(resolveMediaUrl('/media/avatars/a.webp', 'http://localhost')).toBe('http://localhost/media/avatars/a.webp');
    expect(resolveMediaUrl('media/avatars/a.webp', 'http://10.0.2.2')).toBe('http://10.0.2.2/media/avatars/a.webp');
  });

  it('does not double the slash when the API URL ends with one', () => {
    expect(resolveMediaUrl('/media/x.webp', 'https://summitsync.example/')).toBe('https://summitsync.example/media/x.webp');
  });

  it('leaves absolute and protocol-relative URLs alone', () => {
    expect(resolveMediaUrl('https://cdn.shop.example/p.jpg', 'http://localhost')).toBe('https://cdn.shop.example/p.jpg');
    expect(resolveMediaUrl('//cdn.shop.example/p.jpg', 'http://localhost')).toBe('//cdn.shop.example/p.jpg');
    expect(resolveMediaUrl('file:///photo.jpg', 'http://localhost')).toBe('file:///photo.jpg');
  });
});
