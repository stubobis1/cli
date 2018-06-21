const leo = require('leo-sdk');
const leoaws = require("leo-aws");


exports.handler = require("leo-sdk/wrappers/cron.js")(async function(event, context, callback) {
	let settings = Object.assign({
		queue: "Order",
		destination: "https://sqs.us-west-2.amazonaws.com/134898387190/test"
	}, event);

	// read events from a queue
	leo.offload({
			id: context.botId,
			queue: settings.queue,
			limit: 20,
			batch: {
				size: 10
			},
			each: (payloads) => leoaws.sqs.sendMessageBatch({
				QueueUrl: settings.destination,
				Entries: payloads.map((obj, i) => {
					return {
						Id: i.toString(),
						MessageBody: obj.payload.op, // obj.payload.enriched_event.data,
						MessageAttributes: {
							'Bot_ID': {
								DataType: 'String',
								StringValue: context.botId
							},
							'random_number': {
								DataType: 'String',
								StringValue: obj.payload.op, //payload.enrichedNow
							}
						}
					};
				})
			})
		},
		(err) => {
			console.log("All done processing events", err);
			callback(err);
		});
});