var Util = require('lib/Util');

/**
 * 
 * @param {TiUIWindow} window
 * @param {String} title
 * @param {Object} popupOptions
 * -> popupType : {'picker','textarea','textfield','password','image' }
 * -> options : {Array} only if the popupType is 'picker'
 * -> value : {String} if we want the popup to be prepopulated with a value
 * -> maxLength : {Integer}
 * -> key : {String}
 * -> confirmCallback : {Function}
 *      @prop key : {String}
 *      @prop title : {String}
 *      @prop value : {Object|String}
 *  
 * @method show()
 * @method hide()
 * 
 * @event PopupView:cancel
 * @event PopupView:confirm 

 * 
 * @return {Object}
 * 
 */
function PopupView(window, title, popupOptions) {
    // defaults
    var defaults = {
         confirmCallback : false,
         popupType : 'textfield',
         key : null,
         maxLength : undefined
    }; popupOptions = Util._.extend({}, defaults, popupOptions);

    // main view
    var self, 
    // contains the textfield, picker or text area
    input, 
    // initialization function to create the input
    inputInit, 
    // this will only be used if the popupType is 'picker' 
    // it will contain the selected value
    selectedRow, 
    // this will only be used if the popupType is 'picker'
    // it will contain all of the rows in the picker
    rows = [],
    // type of popup window
    popupType = popupOptions.popupType;
    
    // the main popup view, which will not actually be visible
    // but will act as a container for the other views
    var popup = Ti.UI.createView({
        height : '100%',
        width : '100%',
        zIndex : 500
    });
    
    // this is the faded black background to make the popup stand out
    // NOTE : if you added another view on top of this on it too would have
    // and opacity of 0.8
    var fade = Ti.UI.createView({
        backgroundColor : 'Black',
        opacity : 0.8,
        height : '100%',
        width : '100%'
    }); popup.add(fade);
    
    // this is the white panel that will hold the input
    var panel = Ti.UI.createView({
        backgroundColor : 'White',
        borderRadius : '5dp',
        width : '85%',
        top : '75dp',
        height : '200dp'
    }); popup.add(panel);
    
    // header view which will have the cancel and confirm buttons
    var header = Ti.UI.createView({
        backgroundColor : '#464646',
        height : '45dp',
        top : 0
    }); panel.add(header);
    
    // button to close the popup view
    var cancelButton = Ti.UI.createButton({
        title : 'Cancel',
        left : '10dp',
        color : 'White',
        opacity : 0.7        
    }); header.add(cancelButton);
    
    // click event for the cancel button
    cancelButton.addEventListener('click', function(e) {
        e.cancelBubble = true;
        self.hide();
        
        // fire the event back to the parent saying
        // the popup was cancelled
        popup.fireEvent('PopupView:cancel', {
            value : null
        });
    });
    
    
    // button to close the popup view and fires the 
    // confirm event which will pass the value back
    // to the window
    var confirmButton = Ti.UI.createButton({
        title : 'Confirm',
        right : '10dp',
        color : 'White',
        textAlign : 'middleright' 
    }); header.add(confirmButton);
    
    // click event for the confirm button
    var confirmEvent = function(e) {
        if (e)  {
            e.cancelBubble = true;
        }
        // value that will be returned
        var value;
        
        // if selected row exists then you need to get the
        // rows title rather than its value, because it is a 
        // picker
        if (selectedRow) {
            value = selectedRow.__value || selectedRow.getTitle();
        } else if (input.type && input.type === 'image') { // image
            value = input;
        } else {
            value = input.getValue();  
        }
        
        // fire event back to the parent with the value
        // that has been set
        var callbackObj = {
            title : title,
            value : value,
            key : popupOptions.key || null  
        };
        
        if (popupOptions.confirmCallback) {
            popupOptions.confirmCallback(callbackObj);
        } else {
            popup.fireEvent('PopupView:confirm', callbackObj);
        }
        
        // hide the view
        self.hide();
    };
    
    confirmButton.addEventListener('click', confirmEvent);
    
    var titleLabel = Ti.UI.createLabel({
       font : { fontWeight : 'Bold', fontSize : '14dp' },
       color : 'White',
       text : title
    }); header.add(titleLabel);

    // height will need to be different for the text area vs the text field
    var height = undefined;
    var pickerLabel = false;
    switch (popupType) {
        case 'image' : 
            
            var cameraButton = Ti.UI.createButton({
                left : '50dp',
                top : '80dp',
                image : '/images/buttons/button-camera.png'
            });
            
            var galleryButton = Ti.UI.createButton({
                right : '50dp',
                top : '80dp',
                image : '/images/buttons/button-gallery.png'
            });
            
            var openPhoto = function(cameraInit) {
                 cameraInit({
                     animated : true,
                     success : function(cameraMedia) {
                         var image = cameraMedia.media;
                         if (image.width > image.height) {
                             alert("Warning only portrait images are supported for this application, "+
                                   "your image might look skewed if its width is greater than its height");
                         }
                         image = image.imageAsResized(88,113);
                         input = {
                             type : 'image',
                             data : Ti.Utils.base64encode(image)
                         };
                         
                         confirmEvent();
                     },
                     cancel : function(evet) {
                         console.log('popup cancelled');
                     }
                 });
            };
            
            // opens the camera 
            cameraButton.addEventListener('click', function(e) {
                openPhoto(Ti.Media.showCamera);
            });
            
            // opens the gallery
            galleryButton.addEventListener('click', function(e) {
                openPhoto(Ti.Media.openPhotoGallery);
            });
            
            // create a view to hold the buttons
            input = Ti.UI.createView({});
            input.add(cameraButton);
            input.add(galleryButton);

            break;

        case 'picker' :
            // these are the options that will be used by the picker view
            var options = popupOptions.options;
            var selectedIndex = null, selectedRow = null;
            // add a blank row as the first option
            options.unshift('');
            // create rows for the picker
            for (var i=0;i<options.length;i++) {
                var obj = options[i];
                var title, value;
                // check the object type for the picker
                if (Util._.isString(obj) || Util._.isNumber(obj)) {
                    title = obj.toString();
                } else if (Util._.isObject(obj) && obj.title) {
                    title = obj.title;
                    value = obj.value;
                }
                
                // check if the picker has a value if it does set the index to that value
                if (popupOptions.value && title === popupOptions.value) {
                    selectedIndex = i;
                }
                
                // create the pickers row
                var row = Ti.UI.createPickerRow({
                    title : title, 
                    color : 'Black'
                });
                
                // set the value of that row
                if (value) {
                    row.__value = value;
                }
                
                // add that row to the array
                rows.push(row);
            }
            
            // adjust the height of the panel to fit the picker view
            panel.setHeight('300dp');
            
            // create the picker
            input = Ti.UI.createPicker({
                height : '110dp',
                top : '60dp'
            });
            
            // if the os is android then we need to add a label
            // to display the result correctly            
            if (Util.isAndroid()) {
                pickerLabel = Ti.UI.createLabel({
                    top : '135dp',
                    width : '100dp',
                    textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
                    text : value || '',
                    color : 'Black'
                }); 
            }
            
            // if we had a selected index set that selected index
            if (selectedIndex) {
                // columnIndex, rowIndex, animate
                input.setSelectedRow(0, selectedIndex, true);
            }
            
            // this is the titanium studio event listener for 
            // picker view when the row has been changed.
            input.addEventListener('change', function(e) {
                selectedRow = e.row;
                if (pickerLabel) {
                    pickerLabel.setText(e.row.getTitle());   
                }
            });
            
            // add rows
            input.add(rows);
        break;
        
        case 'textarea' : 
            inputInit =Ti.UI.createTextArea;
            height = '110dp'; 
            break;
        
        case 'textfield' :
        case 'password' : 
        default : 
            inputInit = Ti.UI.createTextField;   
        break;   
    }
    
    if (!input) {
        input = inputInit({
            top : '60dp',
            width : '90%',
            height : height,
            color : 'Black',
            maxLength : popupOptions.maxLength
        });
        
        if (popupType === 'password') {
            input.setPasswordMask(true);
        }
                
        if (popupOptions.value && input.setValue) {
            input.setValue(popupOptions.value);
        }
    }
    // add the input to the panel
    panel.add(input);
    if (pickerLabel) {
        panel.add(pickerLabel);    
    }
    
    // returning an object rather than a view
    self = {
        // shows the popup window
        show : function() {
            window.add(popup);
            setTimeout(function() {
                // if the input has a focus method use it to make the keyboard appear
                input.focus && input.focus();    
            }, 500);
        },
        // hides the popup window
        hide : function() {
            window.remove(popup);
        }
    };
    
    return self;
    
}

module.exports = PopupView;
