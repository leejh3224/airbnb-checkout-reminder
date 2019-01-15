/**
 * check if given period requires check in/out today
 * @param period - string represents reservation period
 * ex) 1월 1-3, 2019
 */
const needsCheckInOrOut = (period: string, now = new Date(Date.now())) => {
  // TODO: needs localization
  const periodMatcher = /(\d{1,2})월 (\d{1,2})–(\d{1,2}), 20\d{2}/;
  const matched = periodMatcher.exec(period);

  if (matched) {
    // map types to number
    const [, month, startDate, endDate] = matched.map((match) => Number(match));

    // getMonth() returns an index so in order to compare it with real month, add 1
    const thisMonth = now.getMonth() + 1;
    const currentDate = now.getDate();

    let messageType = null;

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
