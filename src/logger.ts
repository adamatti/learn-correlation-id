import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export const REQUEST_ID_HTTP_HEADER = "x-request-id";
export const ORIGINATOR_REQUEST_ID_HTTP_HEADER = "x-originator-request-id";

type LogContext = {
	OriginatorRequestId: string;
	RequestId: string;
};

const storage = new AsyncLocalStorage();

export const withLogContext = async <R>(
	initialContext: Partial<LogContext>,
	func: (logContext: LogContext) => R,
) => {
	initialContext.OriginatorRequestId =
		initialContext.OriginatorRequestId ?? randomUUID();

	initialContext.RequestId = initialContext.RequestId ?? randomUUID();

	return await storage.run(initialContext, async () => {
		return await func(initialContext as LogContext);
	});
};

export const getLogContext = (): Partial<LogContext> => {
	return storage.getStore() ?? {};
};

const doLog = (level: string) => {
	return (message: string, ...args: any[]) => {
		const context = getLogContext();
		console.log(new Date(), level.toUpperCase(), message, {
			...args,
			...context,
		});
	};
};

const logger = {
	debug: doLog("DEBUG"),
	info: doLog("INFO"),
	warn: doLog("WARN"),
	error: doLog("ERROR"),
};

export default logger;
