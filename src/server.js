const express = require('express');
const fs = require('fs');
const sqlite = require('sql.js');

// const filebuffer = fs.readFileSync('db/ico-info.sqlite3');
const db = new sqlite.Database();

const app = express();

app.set('port', (process.env.PORT || 3001));

// Express only serves static assets in production for React CSR
if (process.env.NODE_ENV === 'production') {
  console.log('serve static');
  app.use(express.static('src/client/build'));
}

const COLUMNS = [
  'foo',
  'bar',
  'baz',
];

// Backend API
app.get('/api/icolist', (req, res) => {
  const param = req.query.q;

  res.json({icolist: [
    {BAT: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF'},
    {Golem: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d'},
    {Gnosis: '0x6810e776880c02933d47db1b9fc05908e5386b96'},
  ]});

  // WARNING: Not for production use! The following statement
  // is not protected against SQL injections.
  // const r = db.exec(`
  //   select ${COLUMNS.join(', ')} from entries
  //   limit 100
  // `);
  //
  // if (r[0]) {
  //   res.json(
  //     r[0].values.map((entry) => {
  //       const e = {};
  //       COLUMNS.forEach((c, idx) => {
  //         // combine fat columns
  //         if (c.match(/^fa_/)) {
  //           e.fat_g = e.fat_g || 0.0;
  //           e.fat_g = (
  //             parseFloat(e.fat_g, 10) + parseFloat(entry[idx], 10)
  //           ).toFixed(2);
  //         } else {
  //           e[c] = entry[idx];
  //         }
  //       });
  //       return e;
  //     }),
  //   );
  // } else {
  //   res.json([]);
  // }
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
