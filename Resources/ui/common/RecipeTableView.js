var RecipeDetailsView = require('ui/common/RecipeView');
var RecipeModel = require('model/RecipeModel');
var Util = require('lib/Util');

/**
 * Table that holds all of the recipes
 * @param {Array} recipes
 * @param {Function} rowClickEvent
 * @param {Function} bottomEvent
 * 
 * @method _addRecipes(data, isEnd)
   @method _reloadData(data, callback)
 * 
 * @event RecipeTableView:reloadTable 
 * @event RecipeTableViewRow:clickEvent
 * @event RecipeTableView:bottom { recipes : {Array}, rows : {Array} }
 * 
 */
function RecipeTableView(recipes, rowClickEvent, bottomEvent) {
    
    // recipe data
    var data = [];
    var lastRow = data.length;
    
    // create the table view
    var self = Ti.UI.createTableView({
        data : data,
        backgroundColor : 'White', // android defaults to transparent
        _lock : false
    }); 
    
    // The following is used for the reloading feature
    var border = Ti.UI.createView({
        backgroundColor:"#576c89",
        height:2,
        bottom:0
    });
    
    var tableHeader = Ti.UI.createView({
        backgroundColor:"#e2e7ed",
        width:320,
        height:60
    });
    
    // fake it til ya make it..  create a 2 pixel
    // bottom border
    tableHeader.add(border);
    
    var arrow = Ti.UI.createView({
        backgroundImage:"/images/graphics/whiteArrow.png",
        width:23,
        height:60,
        bottom:10,
        left:20
    });
    
    var statusLabel = Ti.UI.createLabel({
        bottom:30,
        color:"#576c89",
        font:{fontSize:13,fontWeight:"bold"},
        height:"auto",
        left:55,
        shadowColor:"#999",
        shadowOffset:{x:0,y:1},
        text:"Pull to reload",
        textAlign:"center",
        width:200
    });
    
    var lastUpdatedLabel = Ti.UI.createLabel({
        text:"Last Updated: "+Util.formatDate(),
        left:55,
        width:275,
        bottom:15,
        height:"auto",
        color:"#576c89",
        textAlign:"center",
        font:{fontSize:12},
        shadowColor:"#999",
        shadowOffset:{x:0,y:1}
    });
    
    var actIndicator = Titanium.UI.createActivityIndicator({
        left:20,
        bottom:13,
        width:30,
        height:30
    });
    
    tableHeader.add(arrow);
    tableHeader.add(statusLabel);
    tableHeader.add(lastUpdatedLabel);
    tableHeader.add(actIndicator);
    
    // 
    self.headerPullView = tableHeader;
    
    
    var pulling = false;
    var reloading = false;
    var dataLoading = false;
    
    // function to start reload
    // calls back to the window, then the window will get the data
    // and set it with the ._endReloading function
    function beginReloading() {
        // just mock out the reload
        setTimeout(function() {
            self.fireEvent('RecipeTableView:reloadTable', { });    
        },2000);
    }
    
    
    /**
     * Function fired after the table view has been pulled to reload
     */
    self._endReloading = function() {
        // contentinsets facilitates a margin, or inset, distance 
        // between the content and the container scroll view.
        self.setContentInsets({top:0},{animated:true});
        // we are no longer reloading
        reloading = false;
        // update the text with a timestamp of when it was last updated
        lastUpdatedLabel.text = "Last Updated: "+Util.formatDate();
        statusLabel.text = "Pull down to refresh...";
        
        // hide the activity indicator
        actIndicator.hide();
        // show the arrow again
        arrow.show();    
    };
    
    
    /**
     * Check if the table view is at the bottom
     * @param {Object} e
     */
    function isBottomOfTable(e) {
        if (self._lock) {
            return false;
        }
        
        if (Util.isAndroid()) {
            
            Ti.API.info( 'e.firstVisibleItem: ' + e.firstVisibleItem);
            Ti.API.info( 'e.totalItemCount: ' + e.totalItemCount);
            Ti.API.info( 'e.visibleItemCount: '+ e.visibleItemCount);
            
            return (e.firstVisibleItem + e.visibleItemCount === e.totalItemCount);
        } else {
            var contentHeight = e.contentOffset.y + e.size.height;
            if (contentHeight > e.contentSize.height)  {
                return true;                    
            }  
        }    
        return false;
    }
    
    /**
     * Event listener for scrolling on the table view
     */
    self.addEventListener('scroll',function(e) {   
        // Check if we have reached the bottom of the table view
        if (isBottomOfTable(e)) {
            self._lock = true;
            var obj = {
                recipes : recipes, 
                rows : self.getData()  
            };
            
            if (bottomEvent) {
                bottomEvent(obj);
                return;   
            }
            self.fireEvent('RecipeTableView:bottom', obj);
            return;   
        }
        
        // The following will be used for the pull/reloading table feature
        // note : this code was taken from the KitchenSink app
        if (!e.contentOffset) {
            return;   
        }
        
        var offset = e.contentOffset.y;
        if (offset <= -65.0 && !pulling && !reloading) {
            var t = Ti.UI.create2DMatrix();
            t = t.rotate(-180);
            pulling = true;
            arrow.animate({transform:t,duration:180});
            statusLabel.text = "Release to refresh...";
        } else if (pulling && (offset > -65.0 && offset < 0) && !reloading ) {
            pulling = false;
            var t = Ti.UI.create2DMatrix();
            arrow.animate({transform:t,duration:180});
            statusLabel.text = "Pull down to refresh...";
        }
    });
    
    // the event name was changed so check the version of titanium studio
    // technically since you are most likely using 3.4 or greater you can just
    // use the "dragend"
    var event1 = 'dragEnd';
    if (Ti.version >= '3.0.0') {
        event1 = 'dragend';
    }

    // handles the event listener for the dragend
    self.addEventListener(event1,function(e) {
        // if the offset was enough to signify a "pulling" request and the table
        // is not already reloading, then we will begin the reloading process 
        if (pulling && !reloading) {
            reloading = true;
            pulling = false;
            arrow.hide();
            actIndicator.show();
            statusLabel.text = "Reloading...";
            self.setContentInsets({top:60},{animated:true});
            arrow.transform=Ti.UI.create2DMatrix();
            beginReloading();
        }
    });
    
    /**
     * Loads the table view with data 
     * @param {Array<RecipeModel>} data
     */
    function loadTableData(data) {
        
        if (!data) {
            data = recipes;   
        }
        
        // table view rows
        var rows = [];
        // create a table row for each recipemodel object
        for (var i=0; i<data.length; i++) {
            var recipe = data[i];
            var row = Ti.UI.createTableViewRow({});
            // store the recipe value
            row._recipe = recipe;
            // store the index of the row
            row.index = i;
            // add the recipe details view to the row
            row.add(new RecipeDetailsView(recipe));
            // add a click event
            row.addEventListener('click', function(e) {
                e.cancelBubble = true;
                if (rowClickEvent) {
                    rowClickEvent({recipe: this._recipe });
                    return;    
                }
                
                self.fireEvent('RecipeTableViewRow:clickEvent', { recipe : this._recipe }); 
            }); 
            // add row to the array
            rows.push(row);
        }
        return rows;
    };
    
    /**
     * 
     * Add recipes to existing recipe data
     *  
     * @param {Array<RecipeModel>} data
     * @param {Boolean} isEnd, signifies there are no more rows to be added
     */
    self._addRecipes = function(data, isEnd) {
        dataLoading = false;
        // get the sections, wich will only be one
        var sections = self.getData();
        // if no sections are found then return, table was empty
        if (!sections || sections.length === 0) {
            return;   
        }
        
        // get rows from existing section
        var rows = sections[0].getRows();
        // create new rows
        var newRows = loadTableData(data);
        // add new rows to the existing rows
        rows = rows.concat(newRows);
        
        // set the table data
        self.setData(rows);
        
        // unlock table 
        if (isEnd === false) {
            self._lock = false;    
        }
    };
    
    // load the initial recipes
    if (recipes && recipes.length > 0) {
        loadTableData(recipes);
    }
    
    /**
     * 
     * Replaces all data
     * 
     * @param {Array<RecipeModel>} data
     * @param {Object} callback
     */
    self._reloadData = function(data, callback) {
        recipes = data;
        self.setData(loadTableData());
        callback && callback();
    };
    
    return self;
};

module.exports = RecipeTableView;
