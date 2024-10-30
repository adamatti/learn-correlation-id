import express from "express";
import logger, {
	type LogContext,
	ORIGINATOR_REQUEST_ID_HTTP_HEADER,
	REQUEST_ID_HTTP_HEADER,
	withLogContext,
} from "./logger";
import { serviceHandle } from "./service";

export const app = express();

app.use(async (req, res, next) => {
	// Reuse ids provided
	const initialLogContext: LogContext = {
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
	logger.info("HTTP call Started");

	const subCalls: string = req.query.subCalls as string;

	await serviceHandle({
		subCalls,
	});

	res.json({
		status: "ok",
		date: new Date(),
	});
	logger.info("HTTP call Ended");
});
