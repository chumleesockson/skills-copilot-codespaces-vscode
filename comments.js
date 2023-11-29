// Create web server
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');

// GET /comments
router.get('/', function(req, res, next) {
  Comment.find(function(err, comments){
    if(err){ return next(err); }

    res.json(comments);
  });
});

// POST /comments
router.post('/', function(req, res, next) {
  var comment = new Comment(req.body);

  comment.save(function(err, comment){
    if(err){ return next(err); }

    res.json(comment);
  });
});

// Preload comment objects on routes with ':comment'
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error("can't find comment")); }

    req.comment = comment;
    return next();
  });
});

// GET /comments/:comment
router.get('/:comment', function(req, res) {
  res.json(req.comment);
});

// PUT /comments/:comment/upvote
router.put('/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

// POST /comments/:comment/replies
router.post('/:comment/replies', function(req, res, next) {
  var reply = new Comment(req.body);
  reply.parent = req.comment;

  reply.save(function(err, reply){
    if(err){ return next(err); }

    req.comment.replies.push(reply);
    req.comment.save(function(err, comment) {
      if(err){ return next(err); }

      res.json(reply);
    });
  });
});

// Preload reply objects on routes with ':reply'
router.param('reply', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, reply){
    if (err) { return next(err); }
    if (!reply) { return next(new Error("can't find reply")); }

    req.reply = reply;
    return next();
  });
});

// GET /comments/:comment/replies/:reply
router.get('/:comment/replies/:reply', function(req, res) {
  res.json(req.reply);
});

// PUT /comments/:comment