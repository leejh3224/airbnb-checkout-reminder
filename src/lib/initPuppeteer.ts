import puppeteer from "puppeteer";

const initPuppeteer = async () => {
	return puppeteer.launch({
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-gpu",
			"--disable-dev-shm-usage",
			"--disable-setuid-sandbox",
			"--no-first-run",
			"--no-zygote",
			"--single-process",
		],

		// reuse user profile session
		userDataDir: "./userData",
	});
};

export default initPuppeteer;
