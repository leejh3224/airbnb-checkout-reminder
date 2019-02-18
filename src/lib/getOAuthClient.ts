import * as fs from "fs";
import { google } from "googleapis";
import * as http from "http";
import * as path from "path";
import puppeteer from "puppeteer";
import destroyer from "server-destroy";
import * as url from "url";
import { GMAIL_SCOPES, OAUTH_SERVER_PORT } from "./constants";

const getOAuthClient = (browser: puppeteer.Browser) => {
	const keyPath = path.resolve("oauth2.keys.json");
	let keys: any = { redirect_uris: [""] };
	if (fs.existsSync(keyPath)) {
		keys = require(keyPath).web;
	}

	async function authenticate(scopes: any) {
		return new Promise((resolve, reject) => {
			const oauth2Client = new google.auth.OAuth2(
				keys.client_id,
				keys.client_secret,
				keys.redirect_uris[0],
			);

			const authorizeUrl = oauth2Client.generateAuthUrl({
				access_type: "offline",
				scope: scopes.join(" "),
			});

			const server = http
				.createServer(async (req, res) => {
					try {
						if (req.url!.indexOf("/oauth2callback") > -1) {
							const qs = new url.URL(
								req.url as string,
								`http://localhost:${OAUTH_SERVER_PORT}`,
							).searchParams;
							res.end(
								"Authentication successful! Please return to the console.",
							);
							server.close();
							const { tokens } = await oauth2Client.getToken(qs.get(
								"code",
							) as any);
							oauth2Client.credentials = tokens;
							resolve(oauth2Client);
						}
					} catch (e) {
						reject(e);
					}
				})
				.listen(OAUTH_SERVER_PORT, async () => {
					const [page] = await browser.pages();

					// selectors
					const $me = "content li:first-child";
					const $header = "#headingText > content";
					const $password = 'input[type="password"]';
					const $nextPageButton = "#passwordNext";

					await page.goto(authorizeUrl);
					await page.waitForSelector($me);
					await page.waitFor(3000);
					await page.click($me);

					await page.waitForFunction(
						(text: string, $header: string) => {
							return (
								document.querySelector($header)!.textContent !== text
							);
						},
						{}, // options
						"Choose an account",
						$header
					);

					await page.waitForSelector($password);
					await page.type($password, process.env.password as string);
					await page.click($nextPageButton);
					await page.waitForNavigation();
				});

			destroyer(server);
		});
	}

	return authenticate(GMAIL_SCOPES);
};

export default getOAuthClient;