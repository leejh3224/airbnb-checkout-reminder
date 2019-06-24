async function retry<T>(
  fn: (args: any) => Promise<T>,
  args: any,
  retriesLeft: number = 3,
  interval: number = 1000,
  exponential: boolean = false,
): Promise<T> {
  try {
    const val = await fn(args);
    return val;
  } catch (error) {
    if (retriesLeft) {
      await new Promise(r => setTimeout(r, interval));
      return retry(
        fn,
        args,
        retriesLeft - 1,
        exponential ? interval * 2 : interval,
        exponential,
      );
    } else {
      throw new Error(`Max retries reached for function ${fn.name}`);
    }
  }
}

export default retry;
