var Util = require('lib/Util');
var CryptoJS = require('lib/Crypto');
var BaseModel = require('model/BaseModel');
// Create the user model
var UserModel = new BaseModel('User.php');


var _keyword = "_local_user";
var encrypt = function(email, password, salt) {
    salt = salt || CryptoJS.lib.WordArray.random(256/8).toString();
    var hash = CryptoJS.PBKDF2(password, salt, { 
        keySize: 256/32 , iterations : 4 
    });
    return {
        email : email,
        password_hash : hash.toString(),
        password_salt : salt.toString()
    };
};

/**
 * 
 * Sets the user
 * @param {Object} UserModel
 */
UserModel.setUser = function(user) {
    Ti.App.Properties.setObject(_keyword, user);  
};

/**
 * Gets a user if the user_id and callback exists if they dont exist
 * we will just get the user from our local storage.
 *
 * @param {Integer} user_id
 * @param {Function} callback
 * 
 * @return {UserModel}
 *  
 */
UserModel.getUser = function(user_id, callback) {
    if (user_id && callback) {
        this.GET({ user_id : user_id }, function(result) {
            Ti.App.Properties.setObject(_keyword, result);
            callback(result);
        });
        return;
    }
    return Ti.App.Properties.getObject(_keyword, null);  
};

/**
 * 
 * Authenticate the user
 * 
 * @param {String} email
 * @param {String} password
 * @param {Function} callback
 * 
 */
UserModel.authenticate = function(email, password, callback) {
    var self = this;
    
    this.GET({ auth : email }, function(result) {
        
        if (result && result.success) {
            var salt = result.salt;
            var userauth = encrypt(email, password, salt);
            // get the user
            self.GET({}, function(user) {
                // if success set the user model
                if (user.success) {
                    user.password_hash = userauth.password_hash;
                    user.email = email;
                    UserModel.setUser(user);
                } 
                callback(user);
            }, userauth);    
        } else {
            callback(false); 
        }
    });
};

/**
 * 
 * updates the users password
 * 
 * @param {string} password
 * @param {function} callback
 */
UserModel.update = function(password, callback) {
    var user = UserModel.getUser();
    var auth = encrypt(user.email, password);
    this.PUT({ 
            user_id :user.user_id, 
            password_salt:auth.password_salt 
        }, 
        callback, auth);
    
};

/**
 * 
 * creates the user and save
 * 
 * @param {string} email
 * @param {string} password
 * @param {function} callback
 */
UserModel.create = function(email, password, callback) {
    var auth = encrypt(email, password);
    this.POST({
            password_salt:auth.password_salt
        }, callback, auth);
};


module.exports = UserModel;
