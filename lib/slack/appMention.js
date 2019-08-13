const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-2' });
const SQS = new AWS.SQS();
const regex = /challenge\s*([1-9]\d*)/i;
const QueueUrl = 'https://sqs.eu-west-2.amazonaws.com/021941222346/scavengerHuntEventQueue';

module.exports = async eventData => {
  const { text, channel, ts, user } = eventData.event;
  const result = regex.exec(text);
  if (result) {
    const challengeNum = result[1];

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

    await SQS.sendMessage(queueEvent).promise();
  }
  return {
    statusCode: 200,
    body: 'success'
  };
};
