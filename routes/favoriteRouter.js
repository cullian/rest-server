// Requirements
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();  // can't make routes without a router
favoriteRouter.use(bodyParser.json());  // parse request out for json usage
favoriteRouter.use(Verify.verifyOrdinaryUser); // only verified users, please -- also decodes user _id

// Routes
favoriteRouter.route('/')

    .get(function (req, res, next) {
        Favorites
            .find({ postedBy: req.decoded._doc._id })  // get the users favorites
            .populate('postedBy dishes') // populate the user and favorites into the document
            .exec(function (err, favorite) {  // use callback to make sure there are no errors
                if (err) throw err; // we don't need no stinkin errors
                res.json(favorite);  // return populated document to requester
            });
    })

    .post(function (req, res, next) {
        Favorites.findOne({ postedBy: req.decoded._doc._id }, function (err, favorite) {  // lets see if this user has a favorite
            if (err) throw err;
            if (favorite) { // if there already is a favorite document
                if (favorite.dishes.indexOf(req.body._id) < 0) {  // if the dish doesn't exist
                    favorite.dishes.push(req.body._id);  // push it
                    favorite.save(function (err, favorite) {  // push it good
                        if (err) throw err;  // push it
                        res.json(favorite); // real good
                    });
                } else {  // otherwise it already exists
                    res.json(favorite);
                }
            } else {  // if a favorite document doesn't exist for this user
                Favorites.create({ // make one
                    postedBy: req.decoded._doc._id,  // for this user
                    dishes: [req.body._id]  // and add the favorite too
                }, function (err, favorite) {
                    if (err) throw err;
                    res.json(favorite);  // let requester know what we did

                });
            }
        });
    })

    .delete(function (req, res, next) {  // find and remove the favorite document for the user requesting it
        Favorites.findOneAndRemove({ postedBy: req.decoded._doc._id }, function (err, resp) {
            if (err) throw err;
            res.json(resp);  // let requester know what we did
        });
    });

favoriteRouter.route('/:favoriteId')

    .delete(function (req, res, next) {  // specific removal of dish from favorite document of requesting user
        Favorites.findOne({ postedBy: req.decoded._doc._id }, function (err, favorite) { // find favorite document for user
            if (err) throw err;
            if (favorite) { // if user favorite document exists
                var index = favorite.dishes.indexOf(req.params.favoriteId); // for some reason I can't put this in an if statement
                if (index >= 0) { // so I created an index var to check if the dish exists already
                    favorite.dishes.splice(index, 1); // and delete it
                    favorite.save(function (err, favorite) {
                        if (err) throw err;
                        res.json(favorite);  // save it and return modified unpopulated document to requester
                    });
                } else {  // dish wasn't on the list
                    res.json(favorite); // return modified unpopulated document to requester
                }

            } else {  // no favorite document for this user
                res.json(favorite);  // return modified unpopulated document to requester
            }
        });
    });
// need to make this available for mounting on an endpoint
module.exports = favoriteRouter;
