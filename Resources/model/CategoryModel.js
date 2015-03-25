var Util = require('lib/Util');
var BaseModel = require('model/BaseModel');

// create the category model that inherits from the BaseModel
var _keyword = 'local_category';
var CategoryModel = new BaseModel('Category.php');


/**
 * Returns the categories, if a callback is provided
 * then we will get the categories from the web service
 * otherwise we will just return the categories stored locally
 * 
 * @param {Function} callback
 * @return {Array<CategoryModel>|null}
 */
CategoryModel.getCategories = function(callback) {
    if (callback) {
        this.GET({},function(result) {
            Ti.App.Properties.setObject(_keyword, result);
            callback(result); 
        });
        return;
    }   
    return Ti.App.Properties.getObject(_keyword, null); 
};

/**
 * Get categories, just the names not the object
 * 
 * @return {Array<String>}
 */
CategoryModel.getCategoryNames = function() {
    var categories = this.getCategories();
    var names = [];  
    for (var i=0;i<categories.length;i++) {
        var category = categories[i];
        names.push(category.name);
    }
    return names;
};


/**
 * Helper method to return the category object by name
 * 
 * @param {String} name
 * @return {CategoryModel}
 */
CategoryModel.getCategoryByName = function(name) {
    var categories = this.getCategories();
    if (categories !== null) {
        for (var i=0;i<categories.length;i++) {
            var category = categories[i];
            if (category.name === name) {
                return category;    
            }   
        }
    }
    return null;
};

module.exports = CategoryModel;
