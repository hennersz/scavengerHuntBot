const crypto = require('crypto');
const version = 'v0';

module.exports = event => {
  const slackSecret = process.env['SLACK_SECRET'];
  const hmac = crypto.createHmac('sha256', slackSecret);
  const timeStamp = event.headers['X-Slack-Request-Timestamp'];
  const { body } = event;
  const currTimeSeconds = Date.now() / 1000;
  if (currTimeSeconds - timeStamp > 60 * 5) {
    return false;
  }

  const signingString = version + ':' + timeStamp + ':' + body;
  hmac.update(signingString);
  const signature = 'v0=' + hmac.digest('hex');

  return signature === event.headers['X-Slack-Signature'];
};
