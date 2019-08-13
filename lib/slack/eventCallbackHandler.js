const appMention = require('./appMention');

module.exports = reqData => {
  const eventType = reqData.event.type;
  if (eventType === 'app_mention') {
    return appMention(reqData);
  } else {
    console.log('Unknown event callback type');
    console.log(reqData);
    return {
      statusCode: 200,
      body: 'default response'
    };
  }
}