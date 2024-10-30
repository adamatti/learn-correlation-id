import SQS from "aws-sdk/clients/sqs";
import { snooze } from "./helper";
import logger, {
	getLogContext,
	type LogContext,
	withLogContext,
} from "./logger";
import { serviceHandle } from "./service";

export const queueUrl =
	process.env.SQS_URL ??
	"http://sqs.sa-east-1.localhost.localstack.cloud:4566/000000000000/testQueue";

const sqsOptions = {
	region: "sa-east-1",
	endpoint: "http://localhost:4566",
};

export const sqsClient = new SQS(sqsOptions);

export const sendSQSMessage = async (msg: any) => {
	const logContext = getLogContext();

	const params = {
		MessageAttributes: {
			OriginatorRequestId: {
				DataType: "String",
				StringValue: logContext.OriginatorRequestId,
			},
		},
		MessageBody: JSON.stringify(msg),
		QueueUrl: queueUrl,
	};

	await sqsClient.sendMessage(params).promise();
};

export const startSQSWorker = async () => {
	const params = {
		AttributeNames: ["SentTimestamp"],
		MaxNumberOfMessages: 1,
		MessageAttributeNames: ["All"],
		QueueUrl: queueUrl,
		VisibilityTimeout: 20,
		WaitTimeSeconds: 0,
	};

	while (true) {
		const response = await sqsClient.receiveMessage(params).promise();

		if (response.Messages && response.Messages.length > 0) {
			for await (const message of response.Messages) {
				const initialLogContext: LogContext = {
					RequestId: message.MessageAttributes?.RequestId
						?.StringValue as string,
					OriginatorRequestId: message.MessageAttributes?.OriginatorRequestId
						?.StringValue as string,
				};

				await withLogContext(initialLogContext, async () => {
					const obj = JSON.parse(message.Body as string);
					logger.debug("Sqs message received", { body: obj });

					await serviceHandle(obj);

					await sqsClient
						.deleteMessage({
							QueueUrl: queueUrl,
							ReceiptHandle: message.ReceiptHandle as string,
						})
						.promise();

					logger.debug("Sqs process ended");
				});
			}
		}
		await snooze(1000);
	}
};
