// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var favoriteSchema = new Schema({  // list of favorite dishes for each user
    postedBy: {  // users object id for populating
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'User',
        unique: true  // only one per user
    },
    dishes: [{ // favorite dish object ids for populating
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
        unique: true  // no duplicates
        }]

}, {
        timestamps: true
    });

// the schema is useless so far
// we need to create a model using it
var Favorites = mongoose.model('Favorite', favoriteSchema);

// make this available to our Node applications
module.exports = Favorites;
