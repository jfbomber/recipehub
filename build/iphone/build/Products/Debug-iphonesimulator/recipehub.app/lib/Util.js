

var Util = {
    // underscore library
    _ : require('lib/Underscore'),
    
    /**
     * Is the device running the ios os
     */
    isIOS : function() {
        return Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad';
    },
    
    /**
     * Is the device running the android os
     */
    isAndroid : function() {
        return Ti.Platform.osname === 'android';
    },
    
    /**
     * Is the device and iPhone
     */
    isIPhone : function() {
        return Ti.Platform.osname === 'iphone';  
    },
   
    /**
     * Is the device a tablet
     */
    isTablet : function() {
        var platform = Ti.Platform.osname;
        var isTablet = false;
        switch (platform) {
            case 'ipad' : 
                isTablet = true;
            break;
            case 'android' :
                // we are going to say all android devices are handheld
                /*
                var psc = Ti.Platform.Android.physicalSizeCategory;
                var tiAndroid = Ti.Platform.Android;
                isTablet = psc === Ti.Android.PHYSICAL_SIZE_CATEGORY_LARGE ||
                           psc === Ti.Android.PHYSICAL_SIZE_CATEGORY_XLARGE;
                */
            break;
            case 'iphone' : break;
            default :
                /*
                isTablet = Math.min(Ti.Platform.displayCaps.platformHeight,
                                    Ti.Platform.displayCaps.platformWidth) >= 400;
                */
            break; 
        }
        return isTablet;
    },
    
    /**
     * Returns a date formatted for our recipe table view cell
     * @param {Date} date
     */ 
    formatDate : function(date) {
        // if our date is not given then use the current datetime
        date = date || new Date();
        var minutes = date.getMinutes();
        if (parseInt(minutes) < 10) {
            minutes = "0"+minutes;   
        }
        var datestr = (date.getMonth()+1) + "/" + date.getDate() + "/"+ date.getFullYear();
        if (date.getHours()>= 12) {
            datestr += ' '+(date.getHours() == 12 ? date.getHours() : 
            date.getHours()-12)+":"+minutes+' PM';  
        } else {
            datestr += ' '+date.getHours()+':'+minutes+' AM'; 
        }
        return datestr;
    }
    
   
        
};

module.exports = Util;