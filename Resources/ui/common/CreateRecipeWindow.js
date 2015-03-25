var CategoryModel = require('model/CategoryModel');
var CreateIngredientView = require('ui/common/CreateIngredientView');
var FormTableViewRow = require('ui/common/FormTableViewRow'); 
var FormTableViewSection = require('ui/common/FormTableViewSection'); 
var PopupView = require('ui/common/PopupView');
var RecipeModel = require('model/RecipeModel');
var UserModel = require('model/UserModel');

/**
 * 
 * @path ui/common/CreateRecipeWindow
 */
function CreateRecipeWindow(completeCallback) {
    
    var self = Ti.UI.createWindow({
        title : 'Create Recipe'
    });
    
    var recipe = {
          title : null,
          author_id : UserModel.getUser().user_id,
          categories : null,
          description : null,
          prep_time : null,
          cook_time : null,
          thumbnail : null,
          instructions : [],
          ingredients : []
    };
    
    var sections = [];
        
    var categoryNames = CategoryModel.getCategoryNames();
    
    var basicInfoSection = new FormTableViewSection('Basic Info');
    basicInfoSection.add(new FormTableViewRow(self, 
        'Title', 'title', {
        popupOptions : {
            popupType:'textfield',
            maxLength : 255
        }
    }));
    basicInfoSection.add(new FormTableViewRow(self, 
        'Category', 'category', { 
        popupOptions : {
            popupType : 'picker',
            options : categoryNames
        } 
    }));
    basicInfoSection.add(new FormTableViewRow(self, 
        'Description', 'description', {
        popupOptions : {
            popupType:'textarea'
        }
    }));
    basicInfoSection.add(new FormTableViewRow(self, 
        'Prep Time (min)', 'prep_time', { 
        popupOptions : {
            popupType : 'picker',
            options : Util._.range(0,75,5)
        } 
    }));
    basicInfoSection.add(new FormTableViewRow(self, 
        'Cook Time (min)', 'cook_time', { 
        popupOptions : {
            popupType : 'picker',
            options : Util._.range(0,75,5)
        } 
    }));
    basicInfoSection.add(new FormTableViewRow(self, 
        'Serving Size', 'serving_size', { 
        popupOptions : {
            popupType : 'picker',
            options : Util._.range(1,50)
        } 
    }));
    
    var imageRow = new FormTableViewRow(self, 
        'Thumbnail', 'thumbnail', { 
        popupOptions : {
            popupType : 'image'
        } 
    });
    basicInfoSection.add(imageRow);
    
    // you need this to insert news rows after we add the ingredients
    var ingredientIndex = 7;
    
    var ingredientsSection = new FormTableViewSection('Ingredients');
    ingredientsSection.add(new FormTableViewRow(self, null, null, { 
        action : 'Add Ingredient', 
    }));
    
    var instructionsSection = new FormTableViewSection('Instructions');
    instructionsSection.add(new FormTableViewRow(self, null, null, { 
        action : 'Add Instruction', 
    }));
    
    
    var otherSection = new FormTableViewSection('');
    otherSection.add(new FormTableViewRow(self, null, null, { 
        action : 'Save', 
    }));
    
    sections = [basicInfoSection, ingredientsSection, instructionsSection, otherSection];
    
    var tableView = Ti.UI.createTableView({
        data : sections,
        height : '100%'
    }); self.add(tableView);
    
    
   var createView = new CreateIngredientView(self);
   
   self.addEventListener('CreateIngredientView:add', function(e) {
       // { ingredient.amount, ingredient.unit, ingredient.title }
       var ingredient = e.ingredient;
      
       var row = Ti.UI.createTableViewRow({
           height : '30dp',
           font : {fontSize : '10dp'},
           title : ingredient.amount + " " + (ingredient.unit ? ingredient.unit.name_abbr : '')+ " " + ingredient.title
       });
       recipe.ingredients.push({
           amount : ingredient.amount,
           // unit would be null for something like eggs
           unit_id : ingredient.unit ? ingredient.unit.unit_id : null, 
           ingredient : ingredient.title
       });
       var index = ingredientIndex++;
       var deleteLabel = createDeleteLabel('Ingredient', function() {
           for (var a=0;a<recipe.ingredients.length;a++) {
                if (ingredient.title === recipe.ingredients[a].title) {
                    delete recipe.ingredients.splice(a,1);
                    break;
                }
            }
            ingredientIndex--;
            tableView.deleteRow(row); 
       }); row.add(deleteLabel);
       
       tableView.insertRowAfter(index, row);
       
   });
   
   self.addEventListener('PopupView:confirm', function(e){ 
       
       if (e.key === 'instruction') {
           
           var row = Ti.UI.createTableViewRow({
               font : { fontSize : '10dp'},
               height : '30dp',
               title :e.value
           });
           
           recipe.instructions.push({
              instruction_index : recipe.instructions.length,
              instruction : e.value 
           });
           
           var rowIndex = ingredientIndex + recipe.instructions.length;
           var deleteLabel = createDeleteLabel('Instruction', function() {
               for (var a=0;a<recipe.instructions.length;a++) {
                    if (e.value === recipe.instructions[a].instruction) {
                        recipe.instructions.splice(a,1);
                        break;
                    }
                }
                tableView.deleteRow(row); 
           }); 
           
           row.add(deleteLabel);
           tableView.insertRowAfter(rowIndex, row);
       }
   }); 
    
   /*
    -> isValid {Boolean}
    -> rowTitle {String}
    -> key {String};
    -> value = {String|Object};
        
    */
    self.addEventListener('FormTableViewRow:updateRowValue', function(e) {
        if (e.key === 'category') {
            recipe.categories = [CategoryModel.getCategoryByName(e.value).category_id];
            return;
        } else {
            recipe[e.key] = e.value;
        }
   });
   
   
   
   self.addEventListener('FormTableViewRow:action', function(e) {        
        var action = e.action;
        
        if (action === 'Add Instruction') {
            var instructionPopup = new PopupView(self, 'Instruction', {
                popupType : 'textarea',
                key : 'instruction'
            });
            instructionPopup.show();
        }
        
        if (action === 'Add Ingredient') {
            createView._show();
        }
        
        if (action === 'Save') {
            RecipeModel.insert(recipe, function() {
                if (completeCallback) {
                    completeCallback();
                    return;   
                }
                Ti.App.fireEvent('closeWindow');    
            });
        }
        
        
    });
    
    
    
    return self;
}


var createDeleteLabel = function(title, deleteCallback) {
    var deleteLabel = Ti.UI.createLabel({
           color : 'gray',
           text : 'remove',
           textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
           right : '10dp',
           font : { fontSize : '10dp'}
       });
       
       deleteLabel.addEventListener('click', function(e) {
                // Create alert Dialog with two buttons
                var alertDialog = Ti.UI.createAlertDialog({
                    cancel : 1, // Index of cancel button
                    buttonNames : ['Yes', 'No'], // Button names
                    message : "Are you sure you want to delete this "+title.toLowerCase()+"?",
                    title : title
                });
                
                // Add delegate for Click Event
                alertDialog.addEventListener('click', function(evt){
                    // Get Index of Alert Button
                    var index = evt.index;
                    if (index == 1) {
                        return; 
                    }
                    
                    deleteCallback();
                    
                });
                
                // Show the alert
                alertDialog.show();  
       });
       return deleteLabel;
};







module.exports = CreateRecipeWindow;
