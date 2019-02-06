import puppeteer from "puppeteer";

interface Credentials {
	email: string;
	password: string;
}

/**
 * handles google oauth with popup (in Airbnb page)
 * @param this - bound puppeteer.Browser instance
 * @param credentials - user login credentials, i.e. google email and password
 */
async function login(
	this: puppeteer.Browser,
	credentials: Credentials,
) {
	const home = "https://www.airbnb.com/login";

	// selectors
	const $googleButton = ".btn-google.js-google-auth";
	const $emailInput = "#identifierId";
	const $passwordInput = 'input[type="password"]';
	const $emailNextButton = "#identifierNext";
	const $passwordNextButton = "#passwordNext";

	const [page] = await this.pages();

	// For debugging purpose
	await page.setViewport({ width: 1480, height: 860 });
	await page.goto(home);

	const googleLoginButton = await page.$($googleButton);

	// user is already logged in
	if (!googleLoginButton) {
		return;
	}

	await page.click($googleButton);

	return new Promise((resolve, reject) => {
		// on "targetcreated" triggered when puppeteer opens new tab/popup window
		this.on("targetcreated", async (target: puppeteer.Target) => {
			try {
				const isGoogleOauthPopup = target
					.url()
					.startsWith("https://www.airbnb.co.kr/oauth/popup_form");

				if (isGoogleOauthPopup) {
					const { email, password } = credentials;

					const popup = await target.page();

					// until there are no redirection requests
					await popup.waitForNavigation();
					await popup.waitForSelector($emailInput);
					await popup.type($emailInput, email);
					await popup.click($emailNextButton);

					// TODO: find better way to detect the end of page transition
					const popupHeadingText = "로그인";

					await popup.waitForFunction(
						(text: string) => {
							return (
								document.querySelector("#headingText > content")!
									.textContent !== text
							);
						},
						{}, // options
						popupHeadingText,
					);

					await popup.waitForSelector($passwordInput);
					await popup.type($passwordInput, password);
					await popup.waitForSelector($passwordNextButton);
					await popup.click($passwordNextButton);

					// when login popup closes (redirects to original tab)
					return popup.on("close", () => {
						resolve();
					});
				}
			} catch (error) {
				reject(error);
			}
		});
	});
}

export default login;
