export const retry: <T>(fn: () => Promise<T>, ms?: number) => Promise<T> = <T>(
	fn: () => Promise<T>,
	ms: number = 3000,
) =>
	new Promise<T>((resolve) => {
		fn()
			.then(resolve)
			.catch(() => {
				setTimeout(() => {
					console.log("retrying...");
					retry(fn, ms).then(resolve);
				}, ms);
			});
	});
