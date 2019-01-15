import puppeteer from "puppeteer";

import { getMessage, login, needsCheckInOrOut } from "./lib";

describe.skip("needsCheckInOrOut", () => {
  const date = new Date("2019 1. 15.");

  test.each([
    ["1월 13–18, 2019", date, { required: false, type: null }],
    ["1월 13–15, 2019", date, { required: true, type: "check-out" }],
    ["1월 15–17, 2019", date, { required: true, type: "check-in" }],
    ["1월 20–25, 2019", date, { required: false, type: null }],
    ["2019. 01. 02", date, undefined],
    ["2019. 1월 2일", date, undefined],
  ])("input: %s, %s)", (a, b, expected) => {
    expect(needsCheckInOrOut(a, b)).toEqual(expected);
  });
});

describe("Airbnb message scheduler", () => {
  let browser: puppeteer.Browser;

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--window-size=1460,860"],

      // reuse user profile session
      userDataDir: "./userData",
    });

    // puppeteer test takes longer time than usual tests.
    // so override default jest timeout not to interrupt test
    jest.setTimeout(150000);
  });

  afterEach(async () => {
    await browser.close();
  });

  it.skip("should handle google oauth", async () => {
    const loginSuccessful = await login.bind(browser)({
      email: process.env.email as string,
      password: process.env.password as string,
    });

    // returns nothing
    expect(loginSuccessful).toBe(undefined);
  });

  it("should collect reservation codes", async (done) => {
    await login.bind(browser)({
      email: process.env.email as string,
      password: process.env.password as string,
    });

    // selectors
    const $table = "table._iqk9th";
    const $row = "table._iqk9th > tbody > tr";
    const $cell = "._xc2l5fg";
    const $period = "._9zwlhy1 > ._9zwlhy1";
    const $sendMessageTextarea = "#send_message_textarea";
    const $itineraryButton = 'a[href^="/reservation/itinerary"]';

    const pageList = await browser.pages();
    const page = pageList[0];

    const reservations =
      "https://www.airbnb.co.kr/hosting/reservations/upcoming";
    await page.goto(reservations);

    await page.waitForSelector($table);
    const tableRows = await page.$$($row);

    for await (const [_, row] of tableRows.entries()) {
      const period = await page.evaluate(
        (element, cellSelector, periodSelector) => {
          // reservation period is the 3rd cell
          const [, , periodCell] = element.querySelectorAll(cellSelector);
          return periodCell.querySelector(periodSelector).textContent;
        },
        row,
        $cell,
        $period,
      );

      const checkInOut = needsCheckInOrOut(period, new Date("2019. 01. 18."));

      if (checkInOut && checkInOut.required) {
        const messaging =
          "https://www.airbnb.co.kr/messaging/qt_for_reservation";

        const itineraryButton = await row.$($itineraryButton);

        if (itineraryButton) {
          const itineraryUrl = await page.evaluate(
            (element) => element.href,
            itineraryButton,
          );
          const [, reservationCode] = new URL(itineraryUrl).search.split("=");

          const newTab = await browser.newPage();
          await newTab.goto(`${messaging}/${reservationCode}`);
          await newTab.waitForSelector($sendMessageTextarea);

          // TODO: before sending a message check if message is already sent
          await newTab.type(
            $sendMessageTextarea,
            getMessage(checkInOut.type as any),
          );
          // await newTab.close();
        }
      }
    }

    await done();
  });
});
