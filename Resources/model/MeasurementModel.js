var Util = require('lib/Util');
var BaseModel = require('model/BaseModel');

// create the measurement model that inherits from the BaseModel
var _keyword = 'local_measurement';
var MeasurementModel = new BaseModel('Measurement.php');

/**
 * if a callback exists then fetch the results from the 
 * web service otherwise return the local version if it exists
 * 
 * @param {Function} callback
 */
MeasurementModel.getMeasurements = function(callback) {
    if (callback) {
        this.GET({}, function(result) {
           Ti.App.Properties.setObject(_keyword, result);
           callback(result); 
        });
    }
    return Ti.App.Properties.getObject(_keyword, null);
};



module.exports = MeasurementModel;
