//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan');
    MongoClient = require('mongodb').MongoClient;
    port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
	
const csv = require('csv-parse')
const fs = require('fs')

app.set('view engine', 'ejs');

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);

app.use(express.static('public'))
app.use(morgan('combined'))
app.use(require("body-parser").urlencoded({extended: false}));

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname
let uri = 'mongodb://heroku_0mpp4r58:g7pt0jt9tul537idbspn6i1tlk@ds161833.mlab.com:61833/heroku_0mpp4r58';

app.get('/', function (req, res) {
  
  MongoClient.connect(uri, function(err, client) {
		if(err) throw err;
		let db = client.db('heroku_0mpp4r58');
		var articles_db = db.collection('articles');
		var clusters_db = db.collection('clusters');
		console.log("cluster uploaded")
		var results_counts_db = []
  
		articles_db.find({}).collation({locale: "fr"}).sort({cluster:-1, granular_cluster: -1}).toArray(function (err, art) {
			if(err) throw err;
			
			articles_db.aggregate([{"$group" : {_id:"$journal", count:{$sum:1}}}]).toArray(function(err, journalCounts) {
					if(err) throw err;
					while(results_counts_db.length > 0) {
						results_counts_db.pop();
					}
					journalCounts.forEach(function (journalCount){
						results_counts_db.push(journalCount);
					});
			
				clusters_db.find({}).collation({locale: "fr"}).sort({cluster: -1}).toArray(function (err, clusters) {
					if(err) throw err;
					res.render('render_list_cluster.html', {data_db : art, cluster_db : clusters, count: journalCounts}); 
					client.close(function (err) {if(err) throw err;});

				});
			});
		});
	});
})

app.get('/map', function (req, res) {
  res.render('index.html'); 
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler other than 404
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send('Something bad happened!');;
});

app.listen(port, ip);
module.exports = app ;
