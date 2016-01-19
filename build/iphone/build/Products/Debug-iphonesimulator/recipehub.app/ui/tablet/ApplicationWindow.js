var CategoryModel = require('model/CategoryModel');
var CryptoJS = require('lib/Crypto');
var MenuView = require('ui/common/MenuView');
var PopupView = require('ui/common/PopupView');
var RecipeModel = require('model/RecipeModel');
var RecipeTableView = require('ui/common/RecipeTableView');
var UserModel = require('model/UserModel');
var Util = require('lib/Util');
var RecipeDetailWindow = require('ui/common/RecipeDetailWindow');

var SEARCH_LIMIT = Ti.App.Properties.getInt('search_limit');

/**
 * 
 */
function ApplicationWindow()  {
    
    var detailWindow = Ti.UI.createWindow({ 
        title : 'Recipes', 
        backgroundColor : 'White' 
        });
    
    // add a label for when a recipe has not been selected
    detailWindow.add(Ti.UI.createLabel({ 
        text : 'Select a recipe!' 
    }));
    
    // detail Navigation Window
    var detailNavigation = Ti.UI.iOS.createNavigationWindow({
        window : detailWindow
    });
    
    
    var recipeTableView,
    menuClickEvent, 
    popover = null,
    lastWindow = null;
    
    var searchCriteria = {
        filterBy : null,
        limit : SEARCH_LIMIT,
        offset : 0,
        search : null,
        sortBy : null
    };
    
    // master navigation
    var masterWindow = Ti.UI.createWindow({});
    
    // master navigation left side
    var masterNavigation = Ti.UI.iOS.createNavigationWindow({
        window : masterWindow
    });
    
    ;
    var menuButton = Ti.UI.createButton({
        bottom : '10dp',
        height : '25dp',
        image : '/images/buttons/button-menu.png',
        left : '15dp',
        width : '30dp',
        _toggle : false // custom property to check the status of the menu
    });
    
    var self = Ti.UI.iPad.createSplitWindow({
        detailView : detailNavigation,
        masterView : masterNavigation
    });
    
    masterWindow.setLeftNavButton(menuButton);
    
    
    /**
     * Click event for the menu 
     * @param {Object} e
     */
    var menuClickEvent = function(e) {
        popover.hide();
        
        switch (e.title.toLowerCase()) {
            case 'search' :
                var searchPopup = new PopupView(self, 'Search', {
                        key : 'search',
                        popupType : 'textfield',
                        value : searchCriteria.search      
                }); searchPopup.show();
                break;
            
            case 'sort by': 
                var sortPopup = new PopupView(self, 'Sort By', {
                        key : 'sortBy',
                        options : [
                                    {title:'Most Recent',value:'recipe_created_ts DESC'},
                                    {title:'Oldest', value:'recipe_created_ts ASC'},
                                    {title:'Highest Rated', value:'rating_avg DESC'}
                                  ],
                        popupType : 'picker',
                        value : searchCriteria.sortBy      
                }); sortPopup.show();
                break; 
            
            case 'filter category': 
                var categoryPopup = new PopupView(self, 'Filter By', {
                        key : 'filterBy',
                        options : CategoryModel.getCategoryNames(),
                        popupType : 'picker',
                        value : searchCriteria.filterBy      
                }); categoryPopup.show();
                break; 
            
            case 'reset': 
                searchCriteria = {
                    limit : SEARCH_LIMIT,
                    offset : 0,
                    sortBy : null,
                    filterBy : null,
                    search : null
                };
                
                reloadRecipes(searchCriteria);
                break; 
            
            
            case 'create recipe' : 
                var CreateWindow = require('ui/common/CreateRecipeWindow');
                var createWindow = new CreateWindow(function() {
                    closeWindow();    
                });
                openWindow(createWindow);
                break;
            
            case 'login' : 
                var LoginWindow = require('ui/common/LoginWindow');
                var loginWindow = new LoginWindow(null, loginCallback);
                openWindow(loginWindow);
                menuView._reloadData();
                
                break;
            
            case 'logout' : 
                UserModel.setUser(null);
                menuView._reloadData();
                break;
                
            case 'profile' : 
                var LoginWindow = require('ui/common/LoginWindow');
                var loginWindow = new LoginWindow(null, loginCallback);
                openWindow(loginWindow);
                break;
            
            case 'reference' : 
                var ReferenceWindow = require('ui/common/ReferenceWindow');
                var referenceWindow = new ReferenceWindow();
                openWindow(referenceWindow);
                break;
            
            default :  break;
        }
        
    };
    var menuView = new MenuView(menuClickEvent);
    
    menuButton.addEventListener('click', function(e) {
        var window = Ti.UI.createWindow({});
        if (!popover) {
            popover = Ti.UI.iPad.createPopover({
                height : '450dp',
                width : '300dp',
                contentView : menuView,
                // arrowDirection : Titanium.UI.iPad.POPOVER_ARROW_DIRECTION_DOWN 
            });
        }
        popover.show({
            view : menuButton    
        });
    });
    
    // opens a new window in the detail navigation
    function openWindow(window) {
        if (lastWindow) {
            closeWindow();
        }
        lastWindow = window;
        detailNavigation.openWindow(window);   
    }
    
    // closes the current window
    function closeWindow() {
        lastWindow && lastWindow.close({
            animated : false
        });   
        lastWindow = null;
    }
    
    /**
     * Reloads the recipes, this is called after sort by, filter by,
     * search, and when the table view has been reloaded by the pull down feature
     * 
     * @param {Function} callback
     */
    var reloadRecipes = function(callback) {
        // get all of the recipes from the web service
        RecipeModel.getAll(searchCriteria, function(recipes) {
            try {
                if (!recipeTableView) {
                    recipeTableView = new RecipeTableView(recipes);
                    masterWindow.add(recipeTableView);
                    masterWindow.addEventListener('RecipeTableViewRow:clickEvent', function(e) {
                       var recipe = e.recipe;
                       var recipeDetailWindow = new RecipeDetailWindow(recipe);
                       openWindow(recipeDetailWindow);
                    });   
                    recipeTableView._reloadData(recipes);  
                } else {
                    recipeTableView._reloadData(recipes);   
                }
                
                callback && callback();
            } catch (ex) {
                console.log(ex);
            }
        });   
    };
    
    /**
     * Callback for the login view
     */
    function loginCallback() {
        menuView._reloadData();   
        closeWindow();
        
    }
    
    
    // event listener for the popupview
    self.addEventListener('PopupView:confirm', function(e) {
        
        var value = e.value;
        var key = e.key;
        // filterby requires some code conversion to be added to the criteria
        if (key === 'filterBy') {
            if (value) {
                value = 'category_id eq '+CategoryModel.getCategoryByName(value).category_id;    
            } else {
                value = null;    
            }  
        }
        
        // reset the criteria after a popup view change
        searchCriteria.offset = 0;
        // scroll the table view to the top showing that the table view has been reloaded
        recipeTableView.scrollToTop();
        searchCriteria[key] = value;
        // calls the function to get the recipes from the web service then reload the table view
        reloadRecipes(searchCriteria);
    });
    
    // fetches new data when the bottom of the table is reached
    masterWindow.addEventListener('RecipeTableView:bottom', function(e) {
        searchCriteria.offset += searchCriteria.limit;
        RecipeModel.getAll(searchCriteria, function(results) {
            // time
            setTimeout(function() {
                var isEnd = false;
                if (results.length < searchCriteria.limit) {
                    isEnd = true;
                }
                recipeTableView._addRecipes(results, isEnd);    
            }, 1000);
        });
    });
    
    
    // reloads the table when the menu is pulled down
    masterWindow.addEventListener('RecipeTableView:reloadTable', function(e) {
        recipeTableView.scrollToTop();
        // reset the offset otherwise the table will be empty
        searchCriteria.offset = 0;
        // unlock the table view
        recipeTableView._lock = false;
        recipeTableView._endReloading();
        reloadRecipes(searchCriteria);
    });

    reloadRecipes();
        
    // If the user is not logged in send them to the login window
    if (UserModel.getUser() === null) {
        setTimeout(function() {
            var LoginWindow = require('ui/common/LoginWindow');
            var loginWindow = new LoginWindow(null, loginCallback);
            openWindow(loginWindow);
        }, 250);   
    }
    
    return self;
} 

module.exports = ApplicationWindow;