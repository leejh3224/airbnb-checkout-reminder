import { Translate } from "@google-cloud/translate";

const detectLanguage = async (input: string) => {
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
		return detections[0][0].language === "ko" ? "ko" : "en";
	}

	return "ko";
};

export default detectLanguage;
