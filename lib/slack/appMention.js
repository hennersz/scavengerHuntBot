const AWS = require('aws-sdk');
const regex = /challenge\s*([1-9]\d*)/i;
const QueueUrl = process.env['QUEUE_URL'];

module.exports = async eventData => {
  AWS.config.update({ region: 'eu-west-2' });
  const sqs = new AWS.SQS();

  const { text, channel, ts, user } = eventData.event;
  const match = regex.exec(text);
  if (match) {
    const challengeNum = match[1];

    const queueEvent = {
      QueueUrl,
      MessageBody: JSON.stringify({
        challengeNum,
        channel,
        ts,
        user
      }),
      MessageAttributes: {
        EventType: {
          DataType: 'String',
          StringValue: 'RECEIVE_SUBMISSION'
        }
      }
    };

    await sqs.sendMessage(queueEvent).promise();
  } else {
    const queueEvent = {
      QueueUrl,
      MessageBody: JSON.stringify({
        channel,
        ts,
        user
      }),
      MessageAttributes: {
        EventType: {
          DataType: 'String',
          StringValue: 'BAD_SUBMISSION'
        }
      }
    };

    await sqs.sendMessage(queueEvent).promise();
  }
  return {
    statusCode: 200,
    body: 'success'
  };
};
