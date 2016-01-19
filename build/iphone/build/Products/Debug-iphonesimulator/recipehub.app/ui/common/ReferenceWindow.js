var Util = require('lib/Util');
var MeasurementModel = require('model/MeasurementModel');


function ReferenceWindow() {
    
    var self = Ti.UI.createTabGroup({});
    
    var conversionWindow = Ti.UI.createWindow({ title : 'Reference' });  
    
    var conversionTab = Ti.UI.createTab({
        title: 'Reference Table',
        icon: '/images/icons/icon-ref.png',
        window: conversionWindow
    });
    
    conversionWindow.containingTab = conversionTab;
    self.addTab(conversionTab);
    
    var conversions = [
        ['1 tablespoon','3 teaspoons'],
        ['1 cup','16 tablespoons'],
        ['1 pint','2 cups'],
        ['1 quart','2 pint'],
        ['1 gallon','4 quarts'],
        ['1 cup','8 fluid ounce'],
        ['1 fluid ounce','2 tablespoons'],
    ];
    
    var conversionRows = [];
    for (var i=0;i<conversions.length;i++) {
        var conversion = conversions[i];
        var row = Ti.UI.createTableViewRow({ height : '35dp' });
        
        var leftLabel = Ti.UI.createLabel({
            left : '10dp',
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            text : conversion[0] 
        }); row.add(leftLabel);
        
        var centerLabel = Ti.UI.createLabel({
            text : '=' 
        }); row.add(centerLabel);
        
        var rightLabel = Ti.UI.createLabel({
            right : '10dp',
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            text : conversion[1] 
        }); row.add(rightLabel);
        
        conversionRows.push(row);
    }
    
    var conversionTableView = Ti.UI.createTableView({
        data : conversionRows
    });
    conversionWindow.add(conversionTableView);
    
    
    
    
    /**
     * 
     */
    var abbrWindow = Ti.UI.createWindow({
        title : 'Abbreviations'
    });  
    
    var abbrTab = Ti.UI.createTab({
        title: 'Abbreviations',
        icon: '/images/icons/icon-abbr.png',
        window: abbrWindow
    });
    
    abbrWindow.containingTab = abbrTab;
    self.addTab(abbrTab);
    
    var units = MeasurementModel.getMeasurements().units;
    
    var abbrRows = [];
    for (var i=0;i<units.length;i++) {
        var unit = units[i];
        var row = Ti.UI.createTableViewRow({ height : '35dp' });
        
        var leftLabel = Ti.UI.createLabel({
            font : { fontSize : '12dp' },
            left : '10dp',
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            text : unit.name_abbr.toUpperCase()
        }); row.add(leftLabel);
        
        var centerLabel = Ti.UI.createLabel({
            font : { fontSize : '12dp' },
            text : '=' 
        }); row.add(centerLabel);
        
        var rightLabel = Ti.UI.createLabel({
            font : { fontSize : '10dp' },
            right : '12dp',
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            text : unit.name_full.toUpperCase() 
        }); row.add(rightLabel);
        
        abbrRows.push(row);
    }
    
    var unitTableView = Ti.UI.createTableView({
        data : abbrRows
    });
    
    abbrWindow.add(unitTableView);
    
    
    return self;
}


module.exports = ReferenceWindow;