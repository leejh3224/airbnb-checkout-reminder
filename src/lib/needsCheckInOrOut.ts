const needsCheckInOrOut = (
	period: string,
	now = new Date(Date.now()),
):
	| {
			type: "check-in" | "check-out" | undefined
			required: boolean,
	  }
	| undefined => {
	const periodMatcher = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2})–(\d{1,2})/;
	const matched = periodMatcher.exec(period);

	if (matched) {
		// map types to number
		let [, month, startDate, endDate] = matched.map((match) =>
			isNaN(Number(match)) ? match : Number(match),
		);

		// month to number
		month = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Oct",
			"Nov",
			"Dec",
		].findIndex((m) => m === month);

		const thisMonth = now.getMonth();
		const currentDate = now.getDate();

		let messageType: "check-in" | "check-out" | undefined;

		if (month === thisMonth && startDate === currentDate) {
			messageType = "check-in";
		}

		if (month === thisMonth && endDate === currentDate) {
			messageType = "check-out";
		}

		return {
			required:
				month === thisMonth &&
				(startDate === currentDate || endDate === currentDate),
			type: messageType,
		};
	}
};

export default needsCheckInOrOut;
