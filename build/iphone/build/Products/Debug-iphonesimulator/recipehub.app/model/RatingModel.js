var Util = require('lib/Util');
var UserModel = require('model/UserModel');
var BaseModel = require('model/BaseModel');

// create the rating model that inherits from the BaseModel
var RatingModel = new BaseModel('Rating.php');

/**
 * Adds a user rating to the recipe
 * 
 * @param {Integer} recipe_id
 * @param {Integer} rating
 * @param {Function} callback
 */
RatingModel.rateRecipe = function(recipe_id, rating, callback) {
    var user = UserModel.getUser();
    if (!user) {
        console.log("User must be logged in to rate recipes!");
        return;    
    }  
    
    this.POST({
        user_id : user.user_id,
        recipe_id : recipe_id,
        rating : rating
    }, callback);
};

module.exports = RatingModel;
