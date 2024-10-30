import SQS from "aws-sdk/clients/sqs";
import logger from "./logger";

const sqsOptions = {
	region: "sa-east-1",
	endpoint: "http://localhost:4566",
};
const sqs = new SQS(sqsOptions);

const createQueue = async (queueName: string) => {
	const createResponse = await sqs
		.createQueue({ QueueName: queueName })
		.promise();

	logger.info("Queue created", {
		name: queueName,
		url: createResponse.QueueUrl,
	});

	return {
		name: queueName,
		url: createResponse.QueueUrl,
	};
};

const setup = async () => {
	await createQueue("testQueue");
};

setup();
