var Util = require('lib/Util');

/**
 * @param {Object} options
 * @param {Integer} rating
 */
var RatingView = function(options, rating) {
    var defaults = {
        width : '180dp'    
    }; options = Util._.extend({}, defaults, options);
    
    var self = Ti.UI.createView(options);
    // local variables
    var left;
    
    /**
     * Reloads the rating, use this after the user 
     * has just added a rating for the recipe 
     * 
     * @param {Object} newRating
     */
    var reloadRating = function(newRating) {
          // check if the rating has been loaded yet, if it has
          // remove the old stars
          if (self.getChildren().length > 0) {
              self.removeAllChildren();
          }
          
          // set the rating
          rating = newRating;
          left = 0;
          
          // loop through and create stars
          for (var i = 0; i < 10; i++) {
                var imageSrc = '/images/graphics/star'+ (rating.avg && Math.round(rating.avg) > i ? '-selected' : '') + '.png';
                var imageView = Ti.UI.createImageView({
                    left : left,
                    image : imageSrc,
                    width : '17dp',
                    height : '17dp'
                });
                self.add(imageView);
                // set the new left value
                left += 18;
          }
          // adjust the width of the view
          self.setWidth('180dp');
    };
    
    // load the rating for the first time
    reloadRating(rating);
    
    // set the function to reload the rating
    self._reloadRating = reloadRating;
    
    // return the view
    return self;
};

module.exports = RatingView;