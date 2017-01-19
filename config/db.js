var mongoClient = require('mongodb').MongoClient;

mongoClient.connect('mongodb://localhost:27017/bookmark', function(err, db) {
	if(err) 
		throw err;
	console.log('mongodb connection succesfull.');
	exports.mongodbConnection = db;
});
