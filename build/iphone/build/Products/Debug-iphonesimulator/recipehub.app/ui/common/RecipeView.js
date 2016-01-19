var Util = require('lib/Util');
var HttpService = require('lib/HttpService');
var RatingView = require('ui/common/RatingView');
/**
 * Show details of the recipe
 * 
 * @param {RecipeModel} recipe
 */
function RecipeView(recipe) {
    // load our http service just to get the url for our recipe images
    var http = new HttpService();
    
    // create the recipe view
    var self = Ti.UI.createView({
        top : 0,
        height : '152dp'
    });
    
    // name label
    var nameView = Ti.UI.createView({
        top : '35dp',
        height : '40dp',
        width : '100%',
        backgroundColor : 'Black'
    }); self.add(nameView);
    
    var nameLabel = Ti.UI.createLabel({
        text : recipe.title,
        left : '100dp',
        right : '5dp',
        font : { fontWeight : 'bold', fontSize : '17dp' },
        textAlign : 'left',
        color : 'White'
    }); nameView.add(nameLabel);
    
    
    // image of recipe
    var imageUrl = http.url + "Images/recipe-"+recipe.recipe_id+'.png?nocache=' + 
        Titanium.Platform.createUUID();
    var imageView = Ti.UI.createImageView({
        image : imageUrl,
        left : '7dp',
        top : '22dp',
        width : '85dp',
        height : '113dp',
    }); self.add(imageView);
    
    // description
    var descLabel = Ti.UI.createLabel({
       text : recipe.description,
       left : '100dp',
       top : '95dp',
       color : 'Black',
       width : '210dp',
       height : '40dp',
       font : { fontSize : '12dp' }
    }); self.add(descLabel);
    
    // background for the category label
    var categoryView = Ti.UI.createView({
        right : 0,
        top : '5dp',
        left : 0,
        height : '20dp',
        backgroundColor : '#b2d7ff', 
    }); self.add(categoryView);
    
    // category label
    var categoryLabel = Ti.UI.createLabel({
        textAlign : 'left',
        left : '5dp',
        color : 'Black', // must specify for android
        font : { fontSize : '10dp', fontWeight:'Bold' },
        text : recipe.categories[0].category_name,
    }); categoryView.add(categoryLabel);
    
    // preptime
    var prepTimeLabel = Ti.UI.createLabel({
        textAlign : 'right',
        color : 'Black', // must specify for android
        right : '10dp',
        font : { fontSize : '9dp', fontStyle : 'italic' },
        text : 'Prep Time : ' + recipe.prep_time + ' min | Cook Time : '+recipe.cook_time+ " min ",
    }); categoryView.add(prepTimeLabel);
    
    // ratingView
    var ratingView = new RatingView({
        left : '100dp',
        top : '78dp',
        width : '170dp',
        height : '17dp'
    }, recipe.rating);
    
    // set the reload rating for the recipe detail window
    self._reloadRating = ratingView._reloadRating;
    
    self.add(ratingView);
    
    return self;
}

module.exports = RecipeView;

