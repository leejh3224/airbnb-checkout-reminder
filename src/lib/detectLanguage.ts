import { Translate } from "@google-cloud/translate";
import { logger } from ".";
import {
	LANGUAGE_ENGLISH,
	LANGUAGE_KOREAN,
	LANGUAGE_UNKNOWN,
} from "./constants";

const detectLanguage = async (input: string) => {
	try {
		const translate = new Translate({
			projectId: process.env.GOOGLE_PROJECT_ID,
		});

		const [
			_,
			{
				data: { detections },
			},
		]: any = await translate.detect(input);

		if (detections.length && detections[0].length) {
			const detected = detections[0][0].language;

			if (detected === LANGUAGE_UNKNOWN) {
				return LANGUAGE_KOREAN;
			}

			return detected === LANGUAGE_KOREAN
				? LANGUAGE_KOREAN
				: LANGUAGE_ENGLISH;
		}

		return LANGUAGE_KOREAN;
	} catch (error) {
		logger.error(error);
		return null;
	}
};

export default detectLanguage;
