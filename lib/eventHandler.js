const slackVerify = require('./slack/verifySignature');
const eventCallbackHandler = require('./slack/eventCallbackHandler');
const actionHandler = require('./slack/actionHandler');
const qs = require('qs');

module.exports = async event => {
  try {
    if (!slackVerify(event)) {
      console.log('received request with bad signature');
      return {
        statusCode: 401,
        body: 'Bad signature'
      };
    }
    const reqData = getEventBody(event);
    const { type } = reqData;
    if (type === 'url_verification') {
      return {
        statusCode: 200,
        headers: { 'content-type': 'applicaton/json' },
        body: JSON.stringify({ challenge: reqData.challenge })
      };
    } else if (type === 'event_callback') {
      return eventCallbackHandler(reqData);
    } else if (type === 'block_actions') {
      return actionHandler(reqData);
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
    console.error(event);
    return {
      statusCode: 500,
      body: err
    };
  }
};

const getEventBody = event => {
  const { headers, body } = event;
  if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    return parseFormEncoded(body);
  }

  return JSON.parse(body);
};

const parseFormEncoded = data => {
  const { payload } = qs.parse(data);
  if (!payload) {
    throw new Error('query string did not have payload value');
  }

  return JSON.parse(payload);
};
