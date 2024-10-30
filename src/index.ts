import express from "express";
import logger, {
	ORIGINATOR_REQUEST_ID_HTTP_HEADER,
	REQUEST_ID_HTTP_HEADER,
	withLogContext,
} from "./logger";
import { httpCall } from "./http-client";

const app = express();
const PORT = process.env.PORT ?? 3000;

const snooze = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

app.use(async (req, res, next) => {
	// Reuse ids provided
	const initialLogContext = {
		OriginatorRequestId: req.headers[
			ORIGINATOR_REQUEST_ID_HTTP_HEADER
		] as string,
		RequestId: req.headers[REQUEST_ID_HTTP_HEADER] as string,
	};

	// start log context
	await withLogContext(initialLogContext, (logContext) => {
		// Optional: return ids in the response
		res.set({
			[REQUEST_ID_HTTP_HEADER]: logContext.RequestId,
			[ORIGINATOR_REQUEST_ID_HTTP_HEADER]: logContext.OriginatorRequestId,
		});

		next();
	});
});

app.get("/*", async (req, res) => {
	logger.info("Started");

	const subCalls: number = (req.query.subCalls ?? 0) as number;

	await snooze(1000);
	if (subCalls > 0) {
		await httpCall(`http://localhost:${PORT}/subCall?subCalls=${subCalls - 1}`);
	}

	res.json({
		status: "ok",
		date: new Date(),
	});
	logger.info("Ended");
});

app.listen(PORT, () => {
	logger.info("Running the app");
});
