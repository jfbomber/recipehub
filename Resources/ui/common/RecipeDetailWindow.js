var Util = require('lib/Util');
var RecipeView = require('ui/common/RecipeView');
var UserModel = require('model/UserModel');
/**
 * 
 * @param {RecipeModel} recipe
 */
function RecipeDetailWindow(recipe) { 
    var self = Ti.UI.createWindow({
        backgroundColor : 'White',
        title : recipe.title
    });
    
    var user = UserModel.getUser();
    
    var recipeView = new RecipeView(recipe);
    recipeView.setTop('10dp');
    self.add(recipeView);
    
    // create ingredient/instruciton view
    var ingredientInstructionView = Ti.UI.createView({
        width : '100%',
        bottom : '75dp', 
        top : '175dp',
        backgroundColor : '#ececec'
    });
    // view that is going to hold the ingredients list
    var ingredientView = Ti.UI.createView({ width : Ti.UI.FILL });    
    // ingredients array
    var ingredients = recipe.ingredients;
    // array of views/pages for the scrollable view
    var views = [];
    var html = '<div style="font-size:11pt;font-family:arial;">'+
               '<div style="font-weight:Bold; font-size:14pt;">Ingredients</div>'+
               '<table>';
    Util._.each(ingredients, function(ingredient) {
         html += "<tr>"+
                    "<td>•</td>"+
                    "<td>"+ingredient.amount+"</td>"+
                    "<td style='width:50px;'>"+(ingredient.unit_name_abbr || '')+"</td>"+
                    "<td>"+ingredient.ingredient+"</td>"+
                 "</tr>";
    });
    html += "</table></div>";
    var ingredientScrollView = Ti.UI.createScrollView({
        top : 0,
        height : '90%' 
    });
    
    ingredientScrollView.add(Ti.UI.createWebView({
        html : html,
        enableZoomControls : false, // android only
        scalesPageToFit : false,
        showScrollbars : true,
        width : '85%',
        horizontalWrap : true,
        backgroundColor : '#ececec'
    })); ingredientView.add(ingredientScrollView);
    
    views.push(ingredientView);
    
    var instructions = recipe.instructions;
    Util._.each(instructions, function(instruction) {
         var instructionView = Ti.UI.createView({
             width : '100%',
             height : '90%'
         });
         
         var instructionScrollView = Ti.UI.createScrollView({});
         instructionView.add(instructionScrollView);
         
         var instructionLabel = Ti.UI.createLabel({
            text : instruction.instruction,
            backgroundColor : 'transparent',
            color : 'Black',
            font : { fontSize : '14dp' },
            width : '85%',
            height : Ti.UI.FILL 
         }); instructionScrollView.add(instructionLabel);
         
         
         views.push(instructionView);
    });
    
    var scrollableView = Ti.UI.createScrollableView({
        views : views,
        horizontalWrap : true,
        showPagingControl : true
    }); 
    
    ingredientInstructionView.add(scrollableView);
    // 
    self.add(ingredientInstructionView);
    
    //  add rating view
    var rateMeButton = Ti.UI.createButton({
        title : 'Rate Me!',
        bottom : '45dp',
        textAlign : 'center',
        color : 'blue' 
    });
    
    
    var popupConfirmEvent = function(e) {
         var RatingModel = require('model/RatingModel');
         RatingModel.rateRecipe(recipe.recipe_id, e.value, function(result) {
             
             recipeView._reloadRating(result);
         });
    };
    
    rateMeButton.addEventListener('click', function(e) {
        var PopupView = require('ui/common/PopupView');
        var popupView = new PopupView(self, 'Rate Me', {
            confirmCallback : popupConfirmEvent,
            popupType : 'picker',
            options : Util._.range(1,11) 
        });
        popupView.show();
    });
    
    if (user) {
        self.add(rateMeButton);
    }
    
    return self;
}

module.exports = RecipeDetailWindow;