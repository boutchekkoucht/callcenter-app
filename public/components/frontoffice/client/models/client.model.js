angular
    .module('MainApp')
    .factory('ClientModel', function(){
        return {
            bootstrap : function(user){
                return user;
            }
        }
    });