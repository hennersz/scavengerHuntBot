const { google } = require('googleapis');

module.exports = env => {
  const { DECRYPTED_SHEETS_DATA } = env;
  const KEY = JSON.parse(DECRYPTED_SHEETS_DATA);

  const jwtClient = new google.auth.JWT({
    email: KEY.client_email,
    key: KEY.private_key,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets'
    ]
  });
  const sheets = google.sheets({ version: 'v4', auth: jwtClient });

  return async (data, range, spreadsheetId) => {
    console.log('started getting sheets data');
    const resource = {
      values: data
    };
    return sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      resource,
      valueInputOption: 'USER_ENTERED'
    });
  };
};
