angular
    .module('MainApp')
    .controller('ClientHisCtrl', function($scope,$modal,$filter,ClientSvc,$rootScope,Auth) {

    $scope.client = { requests : []};
   
    Auth.isAlive().success(function(u){
            user = u;
            if(u.isSuperAdmin)
                $state.go('admin');
           
      });

    $scope.searchClient = function(){
        if($scope.clphone){
            
            ClientSvc.getClientByPhone($scope.clphone).then(function(response){
               if(response.data.length == 0)
                    $scope.client =  { requests : []};
                else
                    $scope.client = _.first(response.data);
            })
        }
    }

   
     
       
 })