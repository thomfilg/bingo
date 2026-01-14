import { Agent, setGlobalDispatcher } from 'undici';

import { logger } from '../utils/lib/logger';
import { withAbortController } from './lib/abortController';
import { withConcurrencyLimit } from './lib/concurrencyLimiter';
import { doRequest } from './lib/doRequest';
import { withRateLimit } from './lib/rateLimiter';
import { CONNECT_TIMEOUT_MS, DEFAULT_TIMEOUT_MS } from './lib/requests.types';
import { withRetry } from './lib/retry';

(function configureGlobalDispatcher() {
  try {
    setGlobalDispatcher(new Agent({ connect: { timeout: CONNECT_TIMEOUT_MS } }));
    logger.info(`Configured Global API connect timeout: ${CONNECT_TIMEOUT_MS}ms (env SNOW_CONNECT_TIMEOUT_MS)`);
  } catch (e) {
    logger.warning('Failed to set global dispatcher for connect timeout', e);
  }
})();

export type FetchJSONOptions = {
  path: string;
  signal?: AbortSignal;
  retry?: number;
  timeoutMs?: number;
};

interface IApiFactory {
  baseUrl: string;
  authToken: string;
  concurrency?: number;
  rateLimit?: { max: number; windowMs?: number }
}

export function apiFactory({ baseUrl, authToken, concurrency, rateLimit }: IApiFactory) {
  const normBase = baseUrl.replace(/\/+$/, '');

  let baseAttempt = async <T>(url: string, timeoutMs?: number, externalSignal?: AbortSignal): Promise<T> => withAbortController(
      (abortSignal) => doRequest<T>({ url, authToken, signal: abortSignal }),
      { timeoutMs: timeoutMs ?? DEFAULT_TIMEOUT_MS, externalSignal },
    );

  if (concurrency && concurrency > 0) {
    const prev = baseAttempt;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseAttempt = withConcurrencyLimit<[string, (number | undefined)?, (AbortSignal | undefined)?], any>(
      concurrency,
      (url: string, timeoutMs?: number, externalSignal?: AbortSignal) => prev(url, timeoutMs, externalSignal),
    );
  }

  if (rateLimit && rateLimit.max > 0) {
    const prev = baseAttempt;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseAttempt = withRateLimit<[string, (number | undefined)?, (AbortSignal | undefined)?], any>(
      rateLimit,
      (url: string, timeoutMs?: number, externalSignal?: AbortSignal) => prev(url, timeoutMs, externalSignal),
    );
  }

  async function request<T>({ path, signal, retry = 2, timeoutMs }: FetchJSONOptions): Promise<T> {
    const rel = path.startsWith('/') ? path : `/${path}`;
    const url = `${normBase}${rel}`;
    return withRetry(
      () => baseAttempt(url, timeoutMs, signal),
      {
        retries: retry,
        baseDelayMs: 2000,
        factor: 2,
        onRetry: (err, attempt, nextDelayMs) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logger.info(`Retry ${attempt} for ${url} in ${nextDelayMs}ms due to: ${String((err as any)?.message || err)}`);
        },
      },
    );
  }
  return { request };
}
