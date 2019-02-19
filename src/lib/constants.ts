export const RESERVATION_CONFIRMED = "예약 확정";
export const MAP_TO_HOUSE_URL =
	"https://a0.muscache.com/im/messaging/pictures/005bb2ac-6e18-4db9-abca-544f68af3cac.jpg";
export const SELF_CHECK_IN_BASE_URL =
	"https://www.airbnb.com/reservation/check-in-guide";
export const SELF_CHECK_IN_LINK: { [key: string]: string } = {
	201: "27092267",
	302: "31765470",
	304: "31765531",
	406: "30923304",
	408: "32050698",
	503: "29767093",
};
export const GMAIL_SCOPES = [
	"https://www.googleapis.com/auth/gmail.modify",
	"https://www.googleapis.com/auth/gmail.readonly",
];
export const OAUTH_SERVER_PORT = 3001;

// schedules
export const CHECK_IN_REMINDER_START_HOUR = 7;
export const CHECK_IN_REMINDER_START_MINUTES = 40;
export const ANSWER_TO_RESERVATION_PERIOD = 10;
