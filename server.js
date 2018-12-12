//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan');
const csv = require('csv-parse')
const fs = require('fs')
const results = [];
const results_db = [];
const results_counts_db = [];
const clusters = []
const mongodb = require('mongodb');

// Create seed data

let seedData = [
  {
    titre: 'benalla sous leau',
    journal: 'Le Figaro',
    date: '01/01/1991'
  },
  {
    titre: 'benalla sous leau',
    journal: 'Le Monde',
    date: '01/01/1998'
  },
  {
    titre: 'benalla sous leau',
    journal: 'Libération',
    date: '01/01/2010'
  }
];

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname

let uri = 'mongodb://heroku_0mpp4r58:g7pt0jt9tul537idbspn6i1tlk@ds161833.mlab.com:61833/heroku_0mpp4r58';

mongodb.MongoClient.connect(uri, function(err, client) {

  if(err) throw err;

  /*
   * Get the database from the client. Nothing is required to create a
   * new database, it is created automatically when we insert.
   */

  let db = client.db('heroku_0mpp4r58')

   // Note that the insert method can take either an array or a dict.
    db.listCollections({name: 'articles'})
    .next(function(err, collinfo) {
        if (collinfo) {
            let songs = db.collection('articles');
            console.log("FINDING");
            // The collection exists
            songs.find().toArray(function (err, articles) {
                if(err) throw err;
//                 articles.forEach(function (article) {
//                    results_db.push(article);
//                  });
//                console.log(results_db);
                client.close(function (err) {
                  if(err) throw err;
                });
            });
        }
        else{  
            /*
           * First we'll add a few songs. Nothing is required to create the
           * songs collection; it is created automatically when we insert.
           */
            let songs = db.collection('articles');
            console.log("WRITING");
            songs.insert(seedData, function(err, result) {
                if(err) throw err;
                // Only close the connection when your app is terminating.
                client.close(function (err) {
                  if(err) throw err;
                });
            });
        }
    });
});

var limit=15;
var count=0;
readStream = fs.createReadStream('private/articles_data.csv')
//readStream = fs.createReadStream('../Data/articles-1.csv')
    .pipe(csv({ delimiter: ';' }))
    .on('data', function(csvrow) {
        count++;
        if(count<15){
            results.push(csvrow);
            readStream.end();
        }
    } )
    .on('end', () => {
        //console.log(results);
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
  res.render('index.html'); //,{data22 : results}
});

app.get('/list', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
    mongodb.MongoClient.connect(uri, function(err, client) {

    if(err) throw err;

    /*
    * Get the database from the client. Nothing is required to create a
    * new database, it is created automatically when we insert.
    */

    let db = client.db('heroku_0mpp4r58')

    // Note that the insert method can take either an array or a dict.
    db.listCollections({name: 'articles'}).next(function(err, collinfo) {
        if (collinfo) {
				let songs = db.collection('articles');

				// The collection exists
				console.log("FINDING");
				
				//articles by journal
				songs.aggregate([{"$group" : {_id:"$journal", count:{$sum:1}}}]).toArray(function(err,journalCounts) {
					if(err) throw err;
					while(results_counts_db.length > 0) {
						results_counts_db.pop();
					}
					journalCounts.forEach(function (journalCount){
						results_counts_db.push(journalCount);
					});
					
				//articles
				songs.find().collation( { locale: "fr" } ).sort({titre: 1}).toArray(function (err, articles) {
					if(err) throw err;
					while(results_db.length > 0) {
						results_db.pop();
					}
					 articles.forEach(function (article) {
						dateArticle = new Date(article.date);
						article.date = dateArticle.toLocaleDateString();
						results_db.push(article);
					  });
					  
					//console.log(results_db);
					res.render('list.html',{data_csv : results, data_db : results_db, count : results_counts_db});
					client.close(function (err) {if(err) throw err;});
				});
				
				
				});
			}
        else{  
            /*
           * First we'll add a few songs. Nothing is required to create the
           * songs collection; it is created automatically when we insert.
           */
            let songs = db.collection('articles');
            console.log("WRITING");
            songs.insert(seedData, function(err, result) {
                if(err) throw err;
                res.render('list.html',{data_csv : results, data_db : results_db});
                // Only close the connection when your app is terminating.
                client.close(function (err) {
                  if(err) throw err;
                });
            });
        }
    });
    });
});

app.get('/list_cluster', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
    mongodb.MongoClient.connect(uri, function(err, client) {

    if(err) throw err;

    /*
    * Get the database from the client. Nothing is required to create a
    * new database, it is created automatically when we insert.
    */

    let db = client.db('heroku_0mpp4r58')

    // Note that the insert method can take either an array or a dict.
    db.listCollections({name: 'articles'}).next(function(err, collinfo) {
        if (collinfo) {
			
            let songs = db.collection('articles');

            //articles
            songs.find().collation( { locale: "fr" } ).sort({cluster: -1}).toArray(function (err, articles) {
                if(err) throw err;
                while(results_db.length > 0) {
                    results_db.pop();
                }
                 articles.forEach(function (article) {
										dateArticle = new Date(article.date);
										article.date = dateArticle.toLocaleDateString();
										results_db.push(article);
									});
				var cursor =songs.distinct("cluster");
				cursor.each(function(err, doc) {
						console.log(doc);
						});
				
                res.render('list_cluster.html', {data_db : results_db, unique_cluster : });
                client.close(function (err) {if(err) throw err;});
            });
        }
        else{  
            let songs = db.collection('articles');
            console.log("NOT FINDING");
            res.render('list_cluster.html',{data_db : results_db});
            client.close(function (err) {
              if(err) throw err;
            });
        }
    });
    });
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
