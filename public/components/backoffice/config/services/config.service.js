angular.module('MainApp')
    .factory('ConfigService', function($http){
        return  {
            findAll : function(){
                return $http.get('/config');
            },
            getPublic : function(){
                return $http.get('/config/public')
            },
            set : function(config){
                return $http.put('/config',config)
            },
            shell : function(operation){
                return $http.get('/config/shell/'+operation)
            },
            monitor : {
                start : function(data){
                    return $http.post('/config/app/monitor/start',data)
                },
                stop : function(){
                    return $http.post('/config/app/monitor/stop')
                },
                state : function(){
                    return $http.get('/config/app/monitor/active')
                }
            }

        }
    });