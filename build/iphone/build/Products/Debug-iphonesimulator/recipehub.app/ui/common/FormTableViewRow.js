var Util = require('lib/Util');
var PopupView = require('ui/common/PopupView');

/**
 * @param {TiUIView} parent
 * @param {String} rowTitle
 * @param {String} rowKey
 * @param {Object} rowOptions
 *  -> @prop {Boolean} disabled
 *  -> @prop {String} defaultValue
 *  -> @prop {Object} popupOptions // see PopupView.js'
 *  -> @prop {Boolean} required 
 *  -> @prop {String} rowValue
 *  -> @prop {RegEx|String} validation
 
 * @event FormTableViewRow:updateRowValue { 
 *      {Boolean} isValid
 *      {String} rowTitle 
 *      {String} key
 *      {Object|String} value
 * }
 * @event FormTableViewRow:action { 
 *      {String} action    
 * }
 * 
 *         
 */
function FormTableViewRow(parent, rowTitle, rowKey, rowOptions) {
    // set the default values
    rowOptions = Util._.extend({}, {
        defaultValue : 'Empty',
        rowValue : null,
        action : null,
        disabled : false,
        validation : false,
        required : true,
        actionCallback : false,
        updateCallback : false,
        popupOptions : {
            confirmCallback : confirmEvent,
            key : rowKey,
            value : null,
            options : null,
            popupType : 'textfield'
        }
    }, rowOptions);
    
    // check if the row has an action if it has an action then it will 
    // just be a row with a button. 
    if (rowOptions.action) {
        var self = Ti.UI.createTableViewRow({ height : '65dp' });
        var actionButton = Ti.UI.createButton({
            title : rowOptions.action,
            color : 'Blue'
        }); self.add(actionButton);
        
        actionButton.addEventListener('click', function(e) {
            e.cancelBubble = true;
            // fire the action event

            if (rowOptions.actionCallback !== false && Util._.isFunction(rowOptions.actionCallback)) {
                rowOptions.actionCallback({
                    action: this.getTitle()  
                });
                return;
            }
            self.fireEvent('FormTableViewRow:action', {
                action : this.getTitle()
            }); 
        });
        
        return self;
    }
    
    var rowValue = rowOptions.rowValue || rowOptions.defaultValue;
    var self = Ti.UI.createTableViewRow({ height : '50dp' });
    
    var titleLabel = Ti.UI.createLabel({
        text : rowTitle,
        left : '15dp',
        font : { fontSize : '14dp' },
        width : '45%',
        color : '#c0c0c0',
    }); self.add(titleLabel);
  
    // label will display any validation issues
    var validationLabel = Ti.UI.createLabel({
        color : 'Red',
        font : { fontSize : '10dp' },
        bottom : '2dp',
        left : '15dp',
    }); self.add(validationLabel);
      
    // label will display the value that was entered or selected
    var valueLabel = Ti.UI.createLabel({
        color : rowOptions.disabled === true ? 'gray' : 'black',
        right : '5dp',
        text : rowValue,
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
        width : '45%'
    }); self.add(valueLabel);
    
    /**
     * Sets the value label and will format
     * the label based upon its value and popupType
     * @param {Mixed} value
     */
    var setValue = function(value) {
        if (value.length === 0 && rowOptions.defaultValue) {
            value = rowOptions.defaultValue;
        }
        
        valueLabel.setVisible(true);
        
        if (value === rowOptions.defaultValue || value.length === 0) {
            valueLabel.setFont({fontSize : '12dp', fontWeight : 'normal', fontStyle : 'italic'});
            valueLabel.setColor('#c0c0c0');
        } else {
            valueLabel.setFont({fontSize : '16dp', fontWeight : 'bold', fontStyle : 'normal'});
            valueLabel.setColor('Black');
        }  
        
        if (rowOptions.popupOptions.popupType === 'password' && value !== rowOptions.defaultValue && value.length != 0) {
            valueLabel.setText('•••••••••');
        } else if (value.type && value.type === 'image') { 
            valueLabel.setVisible(false);
            self._setImage(value.data);
            value = value.data.getText();
        } else {
            valueLabel.setText(value);
        }
        
        // reset the validation
        validationLabel.setText('');
        
        // fire the updateRowValue event to let the parent of the 
        // form table view know that a value has been updated 
        var updateObj = {
            title : rowTitle,
            key : rowKey,
            value : value,
            source : self
        };
        if (rowOptions.updateCallback) {
            rowOptions.updateCallback(updateObj);
            return;
        }
        self.fireEvent('FormTableViewRow:updateRowValue', updateObj);
    };
    
    /**
     * Event listened for the PopupView:confirm
     * 
     * @param {Object} e
     */
    var confirmEvent = function(e) {
        var value = e.value;
        setValue(value);    
    };
    
    if (rowOptions.disabled !== true) {
        // add row click event
        self.addEventListener('click', function(e) {

            e.cancelBubble = true;
            // set the value of the popup 
            var value = null;
            if (valueLabel.getText() != rowOptions.defaultValue) {
                value = valueLabel.getText();
            }
            // set popup options
            rowOptions.popupOptions.value = value;
            rowOptions.popupOptions.confirmCallback = confirmEvent;
            // display popup
            var popupView = new PopupView(parent, rowTitle, rowOptions.popupOptions);
            popupView.show();   
            // reset validation label
            validationLabel.setText('');
        });   
    }
    
    
    

    var imageView;
    /**
     * 
     * Sets the image
     * @param {String} imageAs64
     * 
     */
    self._setImage = function(imageAs64) {
        if (!imageAs64 && imageView) {
            self.remove(imageView);
            valueLabel.setVisible(true);
            return;
        }  
        
        if (!imageView) {
            imageView = Ti.UI.createImageView({
                height : '60dp',
                right : '10dp',
                width : '45dp'
            });
        }
        
        imageView.setImage(Ti.Utils.base64decode(imageAs64));
        self.add(imageView);
    };
    
    /**
     * 
     * Sets the validation text
     * 
     * @param {String} text
     */
    self._setValidation = function(text) {
        validationLabel.setText(text);
    };
    
    if (rowValue) {
       
        setValue(rowValue);
    } else {
        setValue(rowOptions.defaultValue);    
    }

    return self;
}


module.exports = FormTableViewRow;
    