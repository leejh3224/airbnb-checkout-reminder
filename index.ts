/* tslint:disable */
import express from 'express'
import cron from 'node-cron'
import puppeteer from 'puppeteer'

import { getMessage, airbnbLogin, needsCheckInOrOut } from './lib'

const port = 3000
const app = express()

// 07:40 everyday
cron.schedule(
	'40 7 * * *',
	async () => {
		try {
			console.time('execution')

			const browser = await puppeteer.launch({
				headless: false,
				args: [
					'--no-sandbox',
					'--disable-gpu',
					'--disable-dev-shm-usage',
					'--disable-setuid-sandbox',
					'--no-first-run',
					'--no-zygote',
					'--single-process',
				],

				// reuse user profile session
				userDataDir: './userData',
			})

			await airbnbLogin.bind(browser)({
				email: process.env.email as string,
				password: process.env.password as string,
			})

			// selectors
			const $table = 'table._iqk9th'
			const $row = 'table._iqk9th > tbody > tr'
			const $cell = '._xc2l5fg'
			const $period = '._9zwlhy1 > ._9zwlhy1'
			const $sendMessageTextarea = '#send_message_textarea'
			const $itineraryButton = 'a[href^="/reservation/itinerary"]'
			const $messageSubmitButton = 'button._1u3zpdpw'

			const pageList = await browser.pages()
			const page = pageList[0]

			const reservations =
				'https://www.airbnb.co.kr/hosting/reservations/upcoming'
			await page.goto(reservations)

			await page.waitForSelector($table)
			const tableRows = await page.$$($row)

			for await (const [_, row] of tableRows.entries()) {
				const period = await page.evaluate(
					(element, cellSelector, periodSelector) => {
						// reservation period is the 3rd cell
						const [, , periodCell] = element.querySelectorAll(
							cellSelector,
						)
						return periodCell.querySelector(periodSelector)
							.textContent
					},
					row,
					$cell,
					$period,
				)

				const checkInOut = needsCheckInOrOut(period)

				if (checkInOut && checkInOut.required) {
					const messaging =
						'https://www.airbnb.co.kr/messaging/qt_for_reservation'

					const itineraryButton = await row.$($itineraryButton)

					if (itineraryButton) {
						const itineraryUrl = await page.evaluate(
							element => element.href,
							itineraryButton,
						)
						const [, reservationCode] = new URL(
							itineraryUrl,
						).search.split('=')

						const newTab = await browser.newPage()
						await newTab.goto(`${messaging}/${reservationCode}`)
						await newTab.waitForSelector($sendMessageTextarea)

						// TODO: before sending a message check if message is already sent
						await newTab.type(
							$sendMessageTextarea,
							getMessage(checkInOut.type as any),
						)
						await newTab.click($messageSubmitButton)
						await newTab.close()

						console.log(
							`done sending message for ${period} ${reservationCode}`,
						)
					}
				}
			}

			await browser.close()
			console.timeEnd('execution')
		} catch (error) {
			console.log(error)
		}
	},
	{
		timezone: 'Asia/Seoul',
	},
)

app.listen(port, () => console.log(`listening to ${port}`))
