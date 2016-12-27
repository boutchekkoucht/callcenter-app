angular.module('MainApp')
    .factory('ClientSvc', function($http){
        return  {
            findAll : function(){
                return $http.get('/api/clients');
            },
            findOne : function(id){
                return $http.get('/api/clients/'+id);
            },
            create : function(client){
                return $http.post('/api/clients',client);
            },
            edit : function(client){
                return $http.put('/api/clients/'+client._id,client);
            },
            delete : function(id){
                return $http.delete('/api/clients/'+id);
            },
            paginate : function(page, limit, pattern){
                return $http.post('/api/clients/'+page+'/'+limit, pattern);
            },
            getClientByPhone : function(phone){
                return $http.get('/api/clients/byphone/'+phone);
            },
            addRequest : function(req){
                 return $http.post('/api/addRequest',req);
            }
            
        }
    });