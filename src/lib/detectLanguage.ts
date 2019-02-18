import { Translate } from "@google-cloud/translate";

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

			if (detected === "und") {
				return "ko";
			}
			return detected === "ko" ? "ko" : "en";
		}

		return "ko";
	} catch (error) {
		throw new Error(`failed to detect language ${error}`);
	}
};

export default detectLanguage;
