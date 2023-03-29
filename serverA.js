'use strict';

// load package
const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use( bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;
const HOST = '0.0.0.0';

//load couchdb
var nano = require('nano')('http://admin:admin@couchdb1:5984');
var posts = nano.use('posts');
var comments = nano.use('comments');

// Get a list of all documents in the database
posts.list((err, body) => {
    if (err) {
      console.log(err)
    } else {
      console.log(body.rows)
    }
  })

app.get('/test', function (req, res) {
	posts.list({ include_docs: true }, function(err, body){
    if (!err) {
      body.rows.forEach(function(doc) {
        res.send(body);
      });
    }
	});
});

//add a new post
app.post('/addPosts', function (req, res) {
  var topic = req.body.topic;
  var data = req.body.data;
  posts.insert({topic, data}, function(err, body) {
    if (err) {
      console.log(err)
    } else {
      res.send(body);
    }
  });
});

//lists all the posts
app.get('/getPosts', function (req, res) {
  posts.view('all_posts', 'all', { include_docs: true }, function(err, body) {
    if (err) {
      console.log(err);
    } else {
      console.log(body);
      var test = [];
      body.rows.forEach(function(doc) {
        console.log(doc.doc);
        test.push({
          'PostID': doc.doc._id, 
          'Topic': doc.doc.topic,
          'PostData': doc.doc.data});
      })
      res.send(test);
    }
  })
});

app.post('/addComments', function(req, res) {
  var postid = req.body.postid;
  var comment = req.body.comment;
  comments.insert({postid, comment}, function(err, body) {
    if (err) {
      console.log(err);
    } else {
      res.send(body);
    }
  })
})

app.get('getComments', function(req, res) {
  comments.show('all_comments', 'format_doc', req, { included_docs: true}, function(err, body) {
    if(err) {
      console.log(err);
    } else {
      console.log(body)
    }
  })
});

app.use("/", express.static('pages'));

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);