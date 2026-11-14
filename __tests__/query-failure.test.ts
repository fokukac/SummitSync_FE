import { ApiError } from '@/api/client';
import { queryFailure } from '@/lib/query-failure';

describe('queryFailure', () => {
  it('tells a missing thing from a forbidden one', () => {
    expect(queryFailure(new ApiError(404, {}))).toBe('notFound');
    expect(queryFailure(new ApiError(403, {}))).toBe('forbidden');
  });

  it('treats everything else as a failure worth retrying', () => {
    expect(queryFailure(new ApiError(500, {}))).toBe('failed');
    expect(queryFailure(new ApiError(422, {}))).toBe('failed');
    expect(queryFailure(new TypeError('Network request failed'))).toBe('failed');
    expect(queryFailure(undefined)).toBe('failed');
  });
});
