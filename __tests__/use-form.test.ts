import { act, renderHook } from '@testing-library/react-native';

import { deleteBody } from '@/api/client';
import { useFormState } from '@/lib/use-form';

const response = (ok: boolean, status = ok ? 200 : 422) => ({ ok, status }) as Response;

describe('useFormState', () => {
  it('returns the result of a successful request and leaves no errors', async () => {
    const { result } = await renderHook(() => useFormState());
    let returned: unknown;

    await act(async () => {
      returned = await result.current.run(Promise.resolve({ response: response(true), data: 1 }));
    });

    expect(returned).toEqual({ response: expect.anything(), data: 1 });
    expect(result.current.errors).toEqual({});
    expect(result.current.message).toBeUndefined();
    expect(result.current.busy).toBe(false);
  });

  it('keeps the first validation message per field on a 422', async () => {
    const { result } = await renderHook(() => useFormState());

    await act(async () => {
      await result.current.run(Promise.resolve({ response: response(false), error: { message: 'Invalid', errors: { username: ['Taken', 'Other'] } } }));
    });

    expect(result.current.errors).toEqual({ username: 'Taken' });
    expect(result.current.message).toBeUndefined();
  });

  it('uses the server message when there are no field errors, and an empty message when the request itself failed', async () => {
    const { result } = await renderHook(() => useFormState());

    await act(async () => {
      await result.current.run(Promise.resolve({ response: response(false, 500), error: { message: 'Server Error' } }));
    });
    expect(result.current.message).toBe('Server Error');

    await act(async () => {
      await result.current.run(Promise.reject(new Error('offline')));
    });
    expect(result.current.message).toBe('');
    expect(result.current.busy).toBe(false);
  });
});

describe('deleteBody', () => {
  it('serializes the body as JSON so passwords never travel in the URL', () => {
    const options = deleteBody({ current_password: 'secret' }) as unknown as { body: unknown; bodySerializer: (value: unknown) => string };

    expect(options.bodySerializer(options.body)).toBe('{"current_password":"secret"}');
  });
});
