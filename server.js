//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan');
const csv = require('csv-parse')
const fs = require('fs')
const results = [];
 
fs.createReadStream('private/data_table_1.csv')
  .pipe(csv({ delimiter: ';' }))
  .on('data', function(csvrow) {
                results.push(csvrow[0]);} )
  .on('end', () => {
  });

app.set('view engine', 'ejs');
app.use(require("body-parser").urlencoded({extended: false}));

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(express.static('public'))
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  res.render('index.html',{data22 : results});
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
