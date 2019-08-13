const slackVerify = require('./slack/verifySignature');
const eventCallbackHandler = require('./slack/eventCallbackHandler');

module.exports = async event => {
  try {
    if (!slackVerify(event)) {
      console.log('received request with bad signature');
      return {
        statusCode: 401,
        body: 'Bad signature'
      };
    }
    const { body } = event;
    const reqData = JSON.parse(body);
    const { type } = reqData;
    if (type === 'url_verification') {
      return {
        statusCode: 200,
        headers: { 'content-type': 'applicaton/json' },
        body: JSON.stringify({ challenge: reqData.challenge })
      };
    } else if (type === 'event_callback') {
      return eventCallbackHandler(reqData);
    } else {
      console.log('Unknown event type');
      console.log(event);
      return {
        statusCode: 200,
        body: 'default response'
      };
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: err
    };
  }
};
