const { PubSub } = require("@google-cloud/pubsub");
import * as fs from "fs";
import { google } from "googleapis";
import * as http from "http";
import * as path from "path";
import * as puppeteer from "puppeteer";
import destroyer from "server-destroy";
import * as url from "url";

import {
	airbnbLogin,
	detectLanguage,
	initPuppeteer,
	main,
	needsCheckInOrOut,
	sendMessage,
} from "./src/lib";

describe.skip("needsCheckInOrOut", () => {
	const date = new Date("2019 1. 15.");

	test.each([
		["Jan 13–18, 2019", date, { required: false, type: null }],
		["Jan 13–15, 2019", date, { required: true, type: "check-out" }],
		["Jan 15–17, 2019", date, { required: true, type: "check-in" }],
		["Jan 20–25, 2019", date, { required: false, type: null }],
		["2019. 01. 02", date, undefined],
		["2019. 02. 20-25", date, undefined],
	])("input: %s, %s)", (a, b, expected) => {
		expect(needsCheckInOrOut(a, b)).toEqual(expected);
	});
});

describe.skip("Airbnb message scheduler", () => {
	let browser: puppeteer.Browser;

	beforeEach(async () => {
		browser = await initPuppeteer(false);

		// puppeteer test takes longer time than usual tests.
		// so override default jest timeout not to interrupt test
		jest.setTimeout(150000);
	});

	afterEach(async () => {
		// await browser.close();
	});

	it.skip("should handle login", async () => {
		const loginResult = await airbnbLogin.bind(browser)({
			email: process.env.email as string,
			password: process.env.password as string,
		});

		expect(loginResult).toBe(true);
	});

	it.skip("should test main", async () => {
		await main(browser, true);
	});
});

describe.skip("etc", () => {
	test.each([
		[
			"안녕하세요!숙소 문의드리고싶어서요�혹시 집에서 바다가 보이나요?",
			"ko",
		],
		[
			"hello, we are coming from germany and looking forward to staying at your place :)",
			"en",
		],
		[
			"퇴사하고 그 동안 힘들었던 것 다 정리하며 머리 식힐겸 바다가 너무 보고싶어서 처음으로 포항 여행을 가려고 합니다^^ 혼자 가는 만큼 아늑하고 교통 편리한 숙소를 찾게 되었어요! 밖에서 지인도 만날거고 아침에도 일출도 보고 여유롭게 조용히 숙소에서 쉬고도 싶어서 결정하게 되었습니다^^ 잘 부탁드려요! 깨끗하게 사용할게요♡ ",
			"ko",
		],
		[
			"Hello Joy, we're a couple exploring southern Korea during the hoilday. Thanks for having us!",
			"en",
		],
		["Qu'est-ce que vous faites?", "en"], // detect french then reply english
	])("should detect `%s` to `%s`", async (input, output, done) => {
		const lang = await detectLanguage(input);
		expect(lang).toBe(output);
		done();
	});
});

describe.skip("send message test", () => {
	let browser: puppeteer.Browser;

	beforeEach(async () => {
		browser = await initPuppeteer(false);

		// puppeteer test takes longer time than usual tests.
		// so override default jest timeout not to interrupt test
		jest.setTimeout(150000);
	});

	afterEach(async () => {
		// await browser.close();
	});

	it("test", async () => {
		try {
			const reservationCode = "HMPSHBSPMJ";

			const [page] = await browser.pages();

			await sendMessage.bind(page)({
				reservationCode,
				type: "check-in",
				isTest: false,
			});
		} catch (error) {
			console.log(error);
		}
	});
});

describe("test", async () => {
	let browser: puppeteer.Browser;

	beforeEach(async () => {
		browser = await initPuppeteer(false);

		// puppeteer test takes longer time than usual tests.
		// so override default jest timeout not to interrupt test
		jest.setTimeout(150000);
	});

	afterEach(async () => {
		// await browser.close();
	});

	it("test", async () => {
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
									"http://localhost:3001",
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
					.listen(3001, async () => {
						const [page] = await browser.pages();
						await page.goto(authorizeUrl);
						await page.waitForSelector("content li:first-child");
						await page.waitFor(3000);
						await page.click("content li:first-child");
						await page.keyboard.type("Enter");

						await page.waitForFunction(
							(text: string) => {
								return (
									document.querySelector("#headingText > content")!
										.textContent !== text
								);
							},
							{}, // options
							"Choose an account",
						);

						await page.waitForSelector('input[type="password"]');
						await page.type('input[type="password"]', process.env
							.password as string);
						await page.click("#passwordNext");
						await page.waitForNavigation();
					});

				destroyer(server);
			});
		}

		const scopes = [
			"https://www.googleapis.com/auth/gmail.modify",
			"https://www.googleapis.com/auth/gmail.readonly",
			"https://www.googleapis.com/auth/gmail.metadata",
		];

		const oauth2Client = await authenticate(scopes);

		const gmail = await google.gmail({
			version: "v1",
			auth: oauth2Client as any,
		});

		const topicName = `projects/${
			process.env.GOOGLE_PROJECT_ID
		}/topics/new-airbnb-mail`;
		const subscriptionName = `projects/${
			process.env.GOOGLE_PROJECT_ID
		}/subscriptions/new-airbnb-mail-sub`;

		const { data } = await gmail.users.watch({
			userId: "me",
			requestBody: {
				labelIds: [process.env.AIRBNB_MAIL_LABEL_ID],
				labelFilterAction: "include",
				topicName,
			},
		} as any);

		const pubsub = new PubSub();

		await pubsub
			.topic(topicName)
			.publish(Buffer.from(JSON.stringify(data)));

		const subscription = pubsub.subscription(subscriptionName);

		subscription.on("message", (msg: any) => {
			const d = JSON.parse(msg.data);
			console.log(d);
			msg.ack();
		});

		// const { data } = await gmail.users.messages.list({
		// 	userId: "me",
		// 	labelIds: [process.env.AIRBNB_MAIL_LABEL_ID],
		// 	maxResults: 15,
		// } as any);

		// for await (const msg of data.messages as any) {
		// 	const { data: data2 } = await gmail.users.messages.get({
		// 		id: msg.id,
		// 		userId: "me",
		// 		format: "metadata",
		// 	});

		// 	const title = data2!.payload!.headers!.find(
		// 		(v) => v.name === "Subject",
		// 	)!.value;

		// 	if (title.includes("예약 확정")) {
		// 		// send message
		// 	}
		// }
	});
});
