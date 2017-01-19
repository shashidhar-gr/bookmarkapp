var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var dbConfig = require('./config/db');
var jwtSecret = 'shashidhar';
var bcrypt = require('bcrypt');

app.use(bodyParser.json());

app.use(expressJwt({ secret: jwtSecret}).unless({path: ['/', '/signup', '/login']}));

app.use(function(req, res, next) {
	var token = req.query.token || req.body.token || req.headers['x-access-token'];
	if(!token)
		return res.status(400).json({success: false, message: 'Authorization code not provided.'})
	next();
});

app.post('/signup', function(req, res) {
	var user = {
		username: req.body.username,
		email: req.body.email,
		password: req.body.password
	}

	var db = dbConfig.mongodbConnection;
	var userColl = db.collection('user');

	bcrypt.genSalt(10, function(err, salt) {
		if(err) throw err;

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err)
				throw err;

			user.password = hash;
			userColl.insert(user, function(err, user) {
				if(err)
					return res.status(500).json({success: false, message: 'Internal server error.'})
				
				return res.status(200).json({success: true, message: 'User signup successfull.'})
			})
		})
	});
});

app.post('/login', function(req, res, next) {
	var db = dbConfig.mongodbConnection;
	var userColl = db.collection('user');

	userColl.findOne({email: req.body.email}, function(err, user) {
		if(err) {
			throw err;
		}
		if(!user){
			console.log('hey1.');
			return res.status(400).json({success: false, message: 'User name and password doesnot match.'}); 
		}

		bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
			if(err) {
				throw err;
			}
			if(!isMatch){
				return res.status(400).json({success: false, message: 'User name and password doesnot match.'})
			}

			next();
		}) 
	});

}, function(req, res){
	var token = jwt.sign({username: req.body.username}, jwtSecret, {expiresIn: 10});
	return res.status(200).json({success: true, message: 'Login successfull', username: req.body.username, token: token})
});

app.get('/profile', function(req, res) {

});


app.use(function(err, req, res, next) {
	return res.status(500).json({success: false, message: err})
});

app.listen(3000, function() {
	console.log('server running on port 3000.');
})