import express from "express";

import { checkInReminder } from "api";

const port = 3000;
const app = express();

checkInReminder("56 10 * * *");

app.listen(port, () =>
	console.log(
		`listening to ${port}, started: ${new Intl.DateTimeFormat(
			"ko-KR",
			{
				year: "numeric",
				month: "numeric",
				day: "numeric",
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				hour12: false,
			},
		).format(new Date(Date.now()))}`,
	),
);
