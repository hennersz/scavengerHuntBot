const AWS = require('aws-sdk');
const processEvent = require('./lib/eventHandler');
AWS.config.update({ region: 'eu-west-2' });

const { SERVICE_WORKER_KEY_ENCRYPTED, SLACK_SECRET_ENCRYPTED } = process.env;
let isDecrypted = false;

exports.handler = async (event, context) => {
  if (isDecrypted) {
    return processEvent(event, context);
  } else {
    try {
      const decrypted = await decryptAll([SERVICE_WORKER_KEY_ENCRYPTED, SLACK_SECRET_ENCRYPTED]);
      const [sheets, slack] = decrypted.map(elem => elem.Plaintext.toString('ascii'));
      process.env['SERVICE_WORKER_KEY'] = sheets;
      process.env['SLACK_SECRET'] = slack;

      // eslint-disable-next-line require-atomic-updates
      isDecrypted = true;
      return processEvent(event, context);
    } catch (err) {
      return {
        statusCode: 500,
        body: 'Error decrypting environment variables'
      };
    }
  }
};

const decryptAll = encVars => {
  const promises = [];
  const kms = new AWS.KMS();
  encVars.forEach(v => {
    promises.push(
      kms
        .decrypt({
          CiphertextBlob: Buffer.from(v, 'base64')
        })
        .promise()
    );
  });

  return Promise.all(promises);
};
