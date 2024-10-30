import { PORT } from "./config";
import { snooze } from "./helper";
import { httpCall } from "./http-client";
import logger from "./logger";
import { sendSQSMessage } from "./sqs";

type HandleBody = {
	subCalls: string;
};

/**
 * Fake service just to do sub calls
 */
export const serviceHandle = async ({ subCalls }: HandleBody) => {
	await snooze(1000);

	if (!subCalls) {
		return;
	}

	const command = subCalls[0];
	const newSubCalls = subCalls.slice(1);

	if (command === "h") {
		const url = `http://localhost:${PORT}/subCall?subCalls=${newSubCalls}`;
		return await httpCall(url);
	}

	if (command === "s") {
		return await sendSQSMessage({
			subCalls: newSubCalls,
		});
	}

	logger.warn("Unknown command received", {
		command,
		subCalls,
	});
};
