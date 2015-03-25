var Util = require('lib/Util');
var MeasurementModel = require('model/MeasurementModel');


/**
 * @param {TiUIWindow} window
 */
function CreateIngredientView(window) {
    // 
    var self = Ti.UI.createView({ 
    height : '100%', width:'100%', backgroundColor : 'White'});
    
    self.add(Ti.UI.createLabel({
        text : 'Add Ingredient',
    }));
    
    // tsp, tbl, c, lt, qt
    var measurement = MeasurementModel.getMeasurements();
    var index = 0;
    var amounts = [];
    
    // ["1","1/2"] second or first value can be empty ""
    var ingredient = {
        amount : ["",""],
        unit_id : null
    };
    
    var wholeNumbers = Util._.range(1,50);
    
    // load the amounts like this 1 1/2, 1 3/4... 15 1/2, 15 3/4...etc
    for (var i=0; i< measurement.amounts.length; i++) {
        var amount = measurement.amounts[i].amount;
        amounts.push(amount);
    }
    
    var textView = Ti.UI.createView({
        borderColor : '#eeeeee',
        borderRadius : '5dp',
        height : '40dp',
        top : '25dp',
        width : '75%'
    }); self.add(textView);
    
    var textField = Ti.UI.createTextField({
        width : '95%',
        maxLength : 40,
        hintText : 'Ingredient'
    }); textView.add(textField);

    var loadRows = function(array, titleField, column) {
        // add a blank row
        column.addRow(Ti.UI.createPickerRow({
            title:'',
            __value:null
        }));
        
        for (var i=0;i<array.length;i++) {
            var obj = array[i];
            
            
            var title; var value = undefined;
            if (Util._.isObject(obj)) {
                title = obj[titleField];
            } else {
                title = obj.toString();
            }
            
            var row = Ti.UI.createPickerRow({ 
                title : title, 
                __value : obj 
            });
            column.addRow(row);
        }
    };
    
    var amountColumn = Ti.UI.createPickerColumn();
    loadRows(amounts, 'amount', amountColumn);
    // 
    var unitColumn = Ti.UI.createPickerColumn();
    loadRows(measurement.units, 'name_abbr', unitColumn);
    // 
    var wholeColumn = Ti.UI.createPickerColumn();
    loadRows(wholeNumbers, null, wholeColumn);
    
    var wholeValue = null, amountValue=null, unitValue=null; 
    var pickerView = Ti.UI.createPicker({
        width : '100%',
        columns : [wholeColumn, amountColumn, unitColumn]
    }); 
    
    pickerView.addEventListener('change', function(e) {
        var columnIndex = e.columnIndex;
        var row = e.row;
        var value = row.__value;
        
        switch (columnIndex) {
            case 2 : ingredient.unit = value; break;
            default : 
                ingredient.amount[columnIndex] = value;   
            break;
        }
        
    }); self.add(pickerView);
    
    
    var addButton = Ti.UI.createButton({
        bottom : '10dp',
        title : 'Add'
    }); 
    
    addButton.addEventListener('click', function(e) {
        e.cancelBubble = true;
        var _ingredient = {
            title : textField.getValue(),
            // [1, 1/2] === "1 1/2"
            amount : ingredient.amount.join(" ").trim(),
            unit : ingredient.unit
        };
        
        // validation
        if (_ingredient.unit_id === null) {
            alert('You must first select a unit!');
            return;
        }
        if (_ingredient.amount.length === 0) {
            alert('You must add some amount!');
            return;
        }
        
        if (_ingredient.title.length === 0) {
           alert('You must add an ingredient name!');
           return;
        }
        
        self._hide();
        
        // fire event back to the parent
        self.fireEvent('CreateIngredientView:add', {
            ingredient : _ingredient
        });
        
    }); self.add(addButton);
    
    
    
    self._show = function() {
        // 
        textField.setValue('');
        
        self.setTop(window.toImage().height);
        window.add(self);
        
        var animation = Ti.UI.createAnimation({
            duration : 250,
            top : 0
        });
        
        self.animate(animation);
    };
    
    self._hide = function() {
        var animation = Ti.UI.createAnimation({
            duration : 250,
            top : window.toImage().height
        });
        
        animation.addEventListener('complete', function() {
            window.remove(self);
        });
        self.animate(animation);
    };
    
    return self;
}

module.exports = CreateIngredientView;

