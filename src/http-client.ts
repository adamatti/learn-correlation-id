import { getLogContext, ORIGINATOR_REQUEST_ID_HTTP_HEADER } from "./logger";

export const httpCall = async (url: string) => {
	const logContext = getLogContext();

	await fetch(url, {
		// Pass context to sub calls
		headers: {
			[ORIGINATOR_REQUEST_ID_HTTP_HEADER]:
				logContext.OriginatorRequestId as string,
		},
	}).then((r) => r.json());
};
