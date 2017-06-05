const express = require('express');
const fs = require('fs');
const sqlite = require('sql.js');
const path = require('path');
const React = require('react');
const matchPath = require('react-router-dom').matchPath;

// const filebuffer = fs.readFileSync('db/ico-info.sqlite3');
const db = new sqlite.Database();

const server = express();

server.set('port', (process.env.PORT || 3001));

const COLUMNS = [
  'foo',
  'bar',
  'baz',
];

// Serves static assets for non-api routes

server.use('/', express.static('src/client/build/'));
// server.use('/client', express.static('src/client/build'));

server.use((req, res, next) => {
  console.log(`[req url] ${req.url}`);
  const match = matchPath(req.path, '/api');
  const { path: pathname, query } = req;

  if (match) {    // API
    const { params } = match;
    console.log(`[match route] ${req.url}`);
    res.json({icolist: [
      {BAT: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF'},
      {Golem: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d'},
      {Gnosis: '0x6810e776880c02933d47db1b9fc05908e5386b96'},
    ]});
    res.end();
  } else {        // client
    res.sendFile("index.html", { root: path.join(__dirname, 'client/build') }, function (err) {
      if (err) { console.log(err); }
    });
  }
});

// Backend API
// server.get('/api/icolist', (req, res) => {
//   const param = req.query.q;
//
//   WARNING: Not for production use! The following statement
//   is not protected against SQL injections.
//   const r = db.exec(`
//     select ${COLUMNS.join(', ')} from entries
//     limit 100
//   `);
//
//   if (r[0]) {
//     res.json(
//       r[0].values.map((entry) => {
//         const e = {};
//         COLUMNS.forEach((c, idx) => {
//           // combine fat columns
//           if (c.match(/^fa_/)) {
//             e.fat_g = e.fat_g || 0.0;
//             e.fat_g = (
//               parseFloat(e.fat_g, 10) + parseFloat(entry[idx], 10)
//             ).toFixed(2);
//           } else {
//             e[c] = entry[idx];
//           }
//         });
//         return e;
//       }),
//     );
//   } else {
//     res.json([]);
//   }
// });

server.listen(server.get('port'), () => {
  console.log(`Find the server at: http://localhost:${server.get('port')}/`); // eslint-disable-line no-console
});
