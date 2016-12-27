angular
    .module('MainApp')
    .controller('ClientCtrl', function($scope,$modal,$filter,ClientSvc,$rootScope,Auth) {

    $scope.client = { requests : []};
    $scope.clphone = "";
    $scope.type = "";
    $scope.request = "";
    $scope.required = {};
    $scope.typeRequests = CONSTANTS.typeRequests;
    
    Auth.isAlive().success(function(u){
            user = u;
            if(u.isSuperAdmin)
                $state.go('admin');
           
        });

    $scope.findClient = function(phone){
    if(phone)
       ClientSvc.getClientByPhone(phone).then(function(response){
               if(response.data.length > 0)
                    $scope.client = _.first(response.data);
            })
    }

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


    $scope.saveClient = function(){

        $scope.required.email = !$scope.client || !$scope.client.email ||!$scope.client.email.trim().length;
        $scope.required.firstName = !$scope.client || !$scope.client.firstName ||!$scope.client.firstName.trim().length;
        $scope.required.lastName = !$scope.client || !$scope.client.lastName ||!$scope.client.lastName.trim().length;
        $scope.required.phone = !$scope.client || !$scope.client.phone ||!$scope.client.phone.trim().length;
        $scope.required.request = $scope.request.trim().length < 0 ;
        $scope.required.type = $scope.type.trim().length < 0;

       
        if (!$scope.required.email && !$scope.required.type && !$scope.required.request && !$scope.required.firstName && !$scope.required.lastName && !$scope.required.phone ) {
           
            var requests = {
                          "agent": $rootScope.currentUser._id,
                          "typeReq" : $scope.type,
                          "request" : $scope.request};

            $scope.client.requests.push(requests);
                if(!$scope.client._id){
                     ClientSvc.create($scope.client).success(function () {
                   
                    $scope.client =  { requests : []};
                    $scope.type = "";
                    $scope.request = "";
                    $scope.clphone = "";
                })
                .error(function(err,code) {
                   // $scope.duplicate.email=true;
                });
            }
            else
            {
                  var newReq =  { id : $scope.client._id,
                        request :{
                          "agent": $rootScope.currentUser._id,
                          "typeReq" : $scope.type,
                          "request" : $scope.request}
                      };
                 ClientSvc.addRequest(newReq).success(function () {
               
                    $scope.client =  { requests : []};
                    $scope.type = "";
                    $scope.request = "";
                    $scope.clphone = "";
                })
                .error(function(err,code) {
                    //$scope.duplicate.email=true;
                });
            }
           
        }

    }
     
       
 })