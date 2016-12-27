angular
    .module('MainApp')
    .factory('UserModel', function(){
        return {
            bootstrap : function(user){
                return user;
            }
        }
    });