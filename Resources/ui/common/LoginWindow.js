var Util = require('lib/Util');
var UserModel = require('model/UserModel');

var FormTableViewRow = require('ui/common/FormTableViewRow');
var FormTableViewSection = require('ui/common/FormTableViewSection');

var LOGIN_TYPE = {
    LOGIN_WITH_CREATE : 'login-create',
    LOGIN_ONLY : 'login',
    CREATE_ONLY : 'create',
    UPDATE : 'update'
};

/**
 * 
 * Window for the user to login
 * 
 * @param {LOGIN_TYPE} loginType
 */
function LoginWindow(loginType, loginCallback) {
    var self = Ti.UI.createWindow({
        backgroundColor : 'White' 
    });
    
    var sections = [];
    
    var loginObj = {
        email : false,
        password : false  
    };
    
    var createObj = {
        email : false,
        password : false,
        confirm_password : false  
    };
    
    loginType = loginType || LOGIN_TYPE.LOGIN_WITH_CREATE;
    
    var updateRowValueEvent = function(e) {
        console.log(e);
        var title = e.title;
        var key = e.key;
        var value = e.value; 
        
        if (key === 'create_email' || key === 'login_email') {
            
             var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
             if (!re.test(value) && value !== 'Empty') {
                 loginObj[key] = false;
                 e.source._setValidation('Email is not valid!');
                 return;
             }  
        }
        
        if (key.indexOf('create_') >= 0) {
            createObj[key.replace('create_','')] = value;   
        } else {
            loginObj[key.replace('login_','')] = value;   
        }
        
        console.log(loginObj);
    };
    
    var formTableViewRowActionEvent = function(e) {
        var action = e.action;
        var valid = true;
        var obj = null;
        
        if (action === 'Create' || action === 'Update') {
            obj = createObj;
        } else {
            obj = loginObj;   
        }
        
        for (var prop in obj) {
            if (obj[prop] === false) {
                alert('One or more fields contains an error or is required');
                return;    
            }   
            
            
        }
        
        if (action === 'Create') {
            if (obj.password !== obj.confirm_password) {
                alert('Password and Confirm Password do not match!');
                return;    
            }
            
            UserModel.create(obj.email, obj.password, function(result) {
                if (result.user_id) {
                    UserModel.setUser(result);    
                } 
            });   
            
            loginCallback && loginCallback();
            Ti.App.fireEvent('closeWindow', {});
        }
        
        if (action === 'Login') {
            console.log("My Object", obj);
            UserModel.authenticate(obj.email, obj.password, function(result) {
                console.log("MY RESULT", result);
                if (!result || result.success === false) {
                    alert('Authentication failed, please try again!'); 
                    return;    
                } 
                loginCallback && loginCallback();
                Ti.App.fireEvent('closeWindow', {});
            });    
        }
    };
    
    
    if (loginType === LOGIN_TYPE.LOGIN_WITH_CREATE || loginType === LOGIN_TYPE.LOGIN_ONLY) {
        var loginSection = new FormTableViewSection('Login');
        loginSection.add(new FormTableViewRow(self, 'email', 'login_email', {
            validation : 'email',
            updateCallback : updateRowValueEvent 
        }));  
        loginSection.add(new FormTableViewRow(self, 'password', 'login_password', {
            updateCallback : updateRowValueEvent,
            popupOptions : {
                popupType : 'password' 
            }
        })); 
        loginSection.add(new FormTableViewRow(self, null, null, {
            action : 'Login',
            actionCallback : formTableViewRowActionEvent 
        })); 
        sections.push(loginSection);
    }
    
    
    if (loginType === LOGIN_TYPE.LOGIN_WITH_CREATE || loginType === LOGIN_TYPE.CREATE_ONLY || loginType === LOGIN_TYPE.UPDATE) {
        var createSection;
        if (loginType === LOGIN_TYPE.UPDATE) {
            createSection = new FormTableViewSection('Update Login');
            var _user = UserModel.getUser();
            if (_user) {
                createObj.email = _user.email;
            }   
        } else {
            createSection = new FormTableViewSection('Create Login');   
        }
         
        createSection.add(new FormTableViewRow(self, 'email', 'create_email', {
            disabled : loginType === LOGIN_TYPE.UPDATE,
            validation : 'email',
            defaultValue : createObj.email
        }));
        createSection.add(new FormTableViewRow(self, 'password', 'create_password', {
            popupOptions : {
                popupType : 'password'   
            }
        }));
        createSection.add(new FormTableViewRow(self, 'confirm password', 'create_confirm_password', {
            popupOptions : {
                popupType : 'password'   
            }
        })); 
        createSection.add(new FormTableViewRow(self, null, null, {
            action : loginType === LOGIN_TYPE.UPDATE ? 'Update' : 'Create'
        })); 
         
        sections.push(createSection);
    }
    
    // Event was not being called by android so I will pass it as a param
    

    self.addEventListener('FormTableViewRow:updateRowValue', updateRowValueEvent);
    
    self.addEventListener('FormTableViewRow:action', formTableViewRowActionEvent);
    
    var tableView = Ti.UI.createTableView({
        data : sections,
        height : '100%' 
    }); self.add(tableView);
    
    return self;
    
}

module.exports = LoginWindow;