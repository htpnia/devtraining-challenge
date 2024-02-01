// npm install googleapis@latest --save
// npm install mathjs --save
// to run the application: node devChallenge.js

const {google} = require('googleapis');
const math = require('mathjs');

async function accessSpreadsheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: '../devtraining-413016-6e9f55593ddc.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
  });

  const client = await auth.getClient();
  const googleSheets = google.sheets({version: 'v4', auth: client});

  const spreadsheetId = '1XJ8bad0kj0PQcNp5ASpb-6t6yOUs8lbeBgQq56a4Ga4'; // ID da sua planilha
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  const sheetName = metaData.data.sheets[0].properties.title;
  const values = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: sheetName + '!C4:F28',
  });

  console.log(values.data.values);

  // Calculating
  const results = calculateResults(values.data.values);

  // Writing the results back to the spreadsheet
 for (let i = 0; i < results.length; i++) {
    await googleSheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: sheetName + '!G' + (i+4) + ':H' + (i+4),
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [results[i]],
      },
    });
  }  
}

function calculateResults(values) {
    const results = [];
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const faltas = parseInt(row[0]);
      const p1 = parseFloat(row[1]);
      const p2 = parseFloat(row[2]);
      const p3 = parseFloat(row[3]);
      const totalAulas = 60;
  
      const media = (p1 + p2 + p3) / 3;
      let situacao = '';
      let naf = 0;
  
      if (faltas > totalAulas * 0.25) {
        situacao = 'Reprovado por Falta';
      } else if (media < 50) {
        situacao = 'Reprovado por Nota';
      } else if (media >= 50 && media < 70) {
        situacao = 'Exame Final';
        naf = Math.ceil((media + naf)/2); // Arredondar para cima
      } else {
        situacao = 'Aprovado';
      }
  
      if (situacao !== 'Exame Final') {
        naf = 0;
      }
  
      results.push([situacao, naf]);
    }
    return results;
  }

accessSpreadsheet().catch(console.error);
