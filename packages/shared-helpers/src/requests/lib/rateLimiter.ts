import type { Task } from './requests.types';

export interface RateLimitOptions {
  /** Max number of executions allowed within the window. */
  max: number;
  /** Window size in ms (default: 60000 = 1 minute). */
  windowMs?: number;
}

/**
 * Create a rate limiter enforcing at most `max` task executions per `windowMs` rolling window.
 * Tasks beyond the limit are queued FIFO and released as soon as capacity becomes available.
 */
export function createRateLimiter({ max, windowMs = 60000 }: RateLimitOptions) {
  if (!Number.isInteger(max) || max < 1) {
    throw new Error("rate limiter 'max' must be a positive integer");
  }
  if (!Number.isInteger(windowMs) || windowMs < 1) {
    throw new Error("rate limiter 'windowMs' must be a positive integer ms value");
  }

  // Timestamps (ms) when tasks started execution (used for rolling window accounting)
  const starts: number[] = [];
  // Pending queue of runners
  const queue: Array<() => void> = [];
  let timer: NodeJS.Timeout | null = null;

  function prune(now: number) {
    // Remove timestamps outside the window
    while (starts.length && starts[0] !== undefined && (now - starts[0]) >= windowMs) {
      starts.shift();
    }
  }

  function scheduleNextCheck() {
    if (timer) return; // already scheduled
    if (!queue.length) return;
    if (!starts.length) {
      // capacity exists (no starts); schedule immediate microtask run
      timer = setTimeout(() => { timer = null; drain(); }, 0);
      return;
    }
    const now = Date.now();
    prune(now);
    if (starts.length < max) {
      timer = setTimeout(() => { timer = null; drain(); }, 0);
      return;
    }
    const waitMs = ((starts[0] ?? now) + windowMs) - now; // when earliest leaves window
    timer = setTimeout(() => { timer = null; drain(); }, Math.max(waitMs, 0));
  }

  function drain() {
    const now = Date.now();
    prune(now);
    while (queue.length && starts.length < max) {
      const run = queue.shift();
      if (!run) break;
      starts.push(Date.now());
      run();
      prune(Date.now()); // keep trimmed if long loops
    }
    if (queue.length) {
      scheduleNextCheck();
    }
  }

  const limit = <T>(task: Task<T>): Promise<T> => new Promise<T>((resolve, reject) => {
    const runner = () => {
      let p: Promise<T>;
      try {
        p = Promise.resolve(task());
      } catch (e) {
        reject(e);
        return;
      }
      p.then(resolve, reject).finally(() => {
        // After completion we don't remove timestamp (timestamp tracks start only). Capacity recovers by time expiry only.
        drain();
      });
    };
    queue.push(runner);
    drain();
    scheduleNextCheck();
  });

  return limit;
}

/** Functional wrapper similar to withConcurrencyLimit  but for rate limiting by time window. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withRateLimit<Args extends any[], R>(opts: RateLimitOptions, fn: (...args: Args) => Promise<R>) {
  const limit = createRateLimiter(opts);
  return (...args: Args): Promise<R> => limit(() => fn(...args));
}
