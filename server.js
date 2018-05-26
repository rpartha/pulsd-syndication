const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const request = require('request');

var app = express();

var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2",
  endpoint: "https://dynamodb.us-east-2.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

app.use(express.static('.'));

app.use(bodyParser.urlencoded({ extended: true })); 

app.post('/addevent', function(req, res){
	const id = crypto.randomBytes(5).toString("hex");

	var today = new Date();
	//need to add date+time to figure out which were added in the past hours
	var params = {
        TableName: "Events",
        Item: {
            "ID":  id,
            "title": req.body.title,
			"start_date":  req.body.sdate,
			"end_date": req.body.edate,
			"description": req.body.description,
			"event_type": req.body.type,
			"datetime_added": today.toISOString()
        }
	};
	
	docClient.put(params, function(err, results) {
		if(err){
			console.error("Unable to add event", req.body.title, ". Error JSON:", JSON.stringify(err, null, 2));
		}

		else{
			console.log("PutItem succeeded: ", req.body.title);
		}
		
	});
});

app.post('/addproduct', function(req, res){
	const id = crypto.randomBytes(6).toString("hex");

	var today = new Date();

	//need to add date+time to figure out which were added in the past hours
	var params = {
        TableName: "Products",
        Item: {
            "model_number":  id,
            "title": req.body.name,
			"product_description":  req.body.description,
			"product_price": parseFloat(req.body.price),
			"product_dimensions": req.body.dims,
			"product_type": req.body.type,
			"datetime_added": today.toISOString()
        }
	};
	
	docClient.put(params, function(err, results) {
		if(err){
			console.error("Unable to add event", req.body.name, ". Error JSON:", JSON.stringify(err, null, 2));
		}

		else{
			console.log("PutItem succeeded: ", req.body.name);
		}
		
	});
});

const port = process.env.PORT || 100;

app.listen(port, function(){
	console.log("pulsd_syndication_app listening on port " + port);
});