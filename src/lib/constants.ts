export const CHECK_IN = "check-in";
export const CHECK_OUT = "check-out";
export const RESERVATION_CONFIRMED = "reservation-confirmed";
export const LANGUAGE_KOREAN = "ko";
export const LANGUAGE_ENGLISH = "en";
export const LANGUAGE_UNKNOWN = "und";
export const TWELVE_MONTHS = [
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
];
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
	"https://www.googleapis.com/auth/gmail.send",
];
export const OAUTH_SERVER_PORT = 3001;

// urls
export const MAP_TO_HOUSE_URL =
	"https://a0.muscache.com/im/messaging/pictures/005bb2ac-6e18-4db9-abca-544f68af3cac.jpg";
export const SELF_CHECK_IN_BASE_URL =
	"https://www.airbnb.com/reservation/check-in-guide";
export const AIRBNB_LOGIN_URL = "https://www.airbnb.com/login";
export const AIRBNB_HOME_URL = "https://www.airbnb.com/hosting";

// schedules
export const CHECK_IN_REMINDER_START_HOUR = 7;
export const CHECK_IN_REMINDER_START_MINUTES = 40;
export const ANSWER_TO_RESERVATION_PERIOD = 10;
