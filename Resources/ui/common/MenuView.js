var Util = require('lib/Util');
var UserModel = require('model/UserModel');

/**
 * Menu on that is displayed when the menu button is clicked
 * @param {Function} menuClickEvent, if provide it is used instead of the event listener
 * @method _reloadData()
 * @event MenuView:rowClickEvent { title : {String}, row : {UITableViewRow} }
 */
function MenuView(menuClickEvent) {
    var self = Ti.UI.createView({
        backgroundImage : '/images/graphics/gradient-bg.png',
        backgroundRepeat : 'vertical',
        height : '100%',
        left : '0',
        width : '200dp'
    });
    
    /**
     * helper function to create a new row 
     * @param {String} name
     */
    var createRow = function(name) {
        // row for the menu
        var row = Ti.UI.createTableViewRow({
            color : 'White',
            font : { fontSize:'12dp' },
            left : '15dp',
            title : name
        });
        
        // add click event
        row.addEventListener('click', function(e) {
            e.cancelBubble = true;
            var eventOjb =  {
                row : row,
                title : this.getTitle()
            };
            // click event if the device is android
            if (menuClickEvent) {
                menuClickEvent(eventOjb);
                return;   
            }
            // click event for ios
            self.fireEvent('MenuView:rowClickEvent', eventOjb);
        });
        return row;
    };
    
    /**
     * Creates header view for tableview section
     * @param {String} text
     */
    var createHeader = function(text) {
        var headerView = Ti.UI.createView({
            height : '40dp',
            backgroundColor : '#f3f3f3'
        });
        
        var headerLabel = Ti.UI.createLabel({
            color : 'Gray',
            font : { fontWeight: 'bold', fontSize : '16dp' },
            left : '10dp',
            text : text
        }); 
        
        headerView.add(headerLabel);
        return headerView;
    };
    
    
    /**
     * Used for reloading the table view after a user logs in or out
     */
    var getRowData = function() {
        var user = UserModel.getUser();
        var title = "Login";
        var sectionRecipes = Ti.UI.createTableViewSection({ 
            headerView: createHeader('Recipes') });
        sectionRecipes.add(createRow('Search'));
        sectionRecipes.add(createRow('Sort By'));
        sectionRecipes.add(createRow('Filter Category'));
        
        if (user) {
            title = "Logout";
            sectionRecipes.add(createRow('Create Recipe'));    
        }
        
        sectionRecipes.add(createRow('Reset'));

        var sectionAccounts = Ti.UI.createTableViewSection({ 
            headerView: createHeader('Account') 
        });
        
        var loginRow = createRow(title);
        sectionAccounts.add(loginRow);
        if (user) {
            sectionAccounts.add(createRow('Profile'));   
        }
        
        var sectionOther = Ti.UI.createTableViewSection({ 
            headerView: createHeader('Other') 
        });
        sectionOther.add(createRow('Reference'));
        return [sectionRecipes, sectionAccounts, sectionOther];
    };
    
    
    var table = Ti.UI.createTableView({
        backgroundColor : 'transparent',
        data: getRowData()
    }); self.add(table);
    
    /**
     * Reloads the table view - this is needed if the user 
     * changes from logged in to not logged in
     */
    self._reloadData = function() {
        table.setData(getRowData());
    };
    
    return self;
}

module.exports = MenuView;
