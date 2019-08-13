const { interactionEvent, callbackEvent } = require('./testData/events.json');
const eventHandler = require('../lib/eventHandler');

jest.mock('../lib/slack/verifySignature');
const slackVerifyMock = require('../lib/slack/verifySignature');
slackVerifyMock.mockReturnValue(true);

jest.mock('../lib/slack/actionHandler');
const actionHandlerMock = require('../lib/slack/actionHandler');
actionHandlerMock.mockReturnValue({
  statusCode: 200,
  body: 'action received'
});

jest.mock('../lib/slack/eventCallbackHandler');
const eventCallbackHandlerMock = require('../lib/slack/eventCallbackHandler');
eventCallbackHandlerMock.mockReturnValue({
  statusCode: 200,
  body: 'success'
});

test('event handler can parse x-www-form-urlencoded from body', async () => {
  const res = await eventHandler(interactionEvent);
  expect(slackVerifyMock).toBeCalled();
  expect(res.statusCode).toBe(200);
});

test('json is parsed from body', async () => {
  const res = await eventHandler(callbackEvent);
  expect(res.statusCode).toBe(200);
});

test('slack verify failing returns 401', async () => {
  slackVerifyMock.mockReturnValue(false);
  const res = await eventHandler(interactionEvent);
  expect(res.statusCode).toBe(401);
});
