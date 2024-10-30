import { PORT } from "./config";
import { app } from "./http-server";
import logger from "./logger";
import { startSQSWorker } from "./sqs";

app.listen(PORT, async () => {
	startSQSWorker();
	logger.info("Running the app");
});
