require('dotenv').config();
const AWS = require('aws-sdk-mock');
const appMention = require('../../lib/slack/appMention');

const mock = jest.fn((params, callback) => {
  callback(null, 'success');
});
AWS.mock('SQS', 'sendMessage', mock);

afterEach(() => {
  mock.mockClear();
});

afterAll(() => {
  AWS.restore();
});

test('app mention handler adds submission event to queue on correct text', async () => {
  const res = await appMention({
    event: {
      text: 'challenge 3',
      channel: 'test',
      ts: 'ts',
      user: 'user'
    }
  });

  expect(res.statusCode).toBe(200);
  expect(mock.mock.calls.length).toBe(1);
  expect(mock.mock.calls[0][0].MessageBody).toBe(
    JSON.stringify({
      challengeNum: '3',
      channel: 'test',
      ts: 'ts',
      user: 'user'
    })
  );
});

test('app mention handler adds error message event to queue on bad text', async () => {
  const res = await appMention({
    event: {
      text: 'bad text',
      channel: 'test',
      ts: 'ts',
      user: 'user'
    }
  });

  expect(res.statusCode).toBe(200);
  expect(mock.mock.calls.length).toBe(1);
  expect(mock.mock.calls[0][0].MessageAttributes.EventType.StringValue).toBe('BAD_SUBMISSION');
});
