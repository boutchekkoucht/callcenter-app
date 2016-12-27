angular
    .module('MainApp')
    .controller('UserCtrl', function($scope,$modal,$filter,UserSvc) {

        $scope.tab = 1;

        $scope.setTab = function(newTab){
            $scope.tab = newTab;
        };

        $scope.isSet = function(tabNum){
            return $scope.tab === tabNum;
        };


     $scope.tabs={users:true};
     $scope.pagination = {itemsPerPage : 8,currentPage : 1};
     $scope.filter={};
     $scope.roles={}
     
     function populateUsers(){
        UserSvc.paginate($scope.pagination.currentPage,$scope.pagination.itemsPerPage,$scope.filter)
                            .success(function(response){
                                $scope.pagination.totalItems=response.count;
                                $scope.users=response.data;

                    });
     }

     populateUsers();
    

        $scope.$watch('pagination.currentPage', function(newPage, oldPage) {
                 if(newPage !== oldPage){
                    populateUsers();
                 }
        });

        $scope.$watch('filter',function(pattern){
                if(_.isEmpty()){
                    populateUsers();
                }
         },true);


    	$scope.addUser = function(){
    		var modalInstance = $modal.open({
                templateUrl  : 'components/backoffice/user/views/user-add.html',
                size : 'lg',
                controller   : function($scope,$modalInstance,$location) {
                    $scope.required = {};
                    $scope.duplicate ={};
                    $scope.valide = {email:true};


                    $scope.save = function() {
                        $scope.required.email = !$scope.user || !$scope.user.email ||!$scope.user.email.trim().length;
                        $scope.required.firstName = !$scope.user || !$scope.user.firstName ||!$scope.user.firstName.trim().length;
                        $scope.required.lastName = !$scope.user || !$scope.user.lastName ||!$scope.user.lastName.trim().length;
                        $scope.required.password = !$scope.user || !$scope.user.password ||!$scope.user.password.trim().length;
                        
                        if (!$scope.required.email &&  !$scope.required.firstName && !$scope.required.lastName && !$scope.required.password) {
                            
                            UserSvc.create($scope.user).success(function () {
                                $modalInstance.dismiss('cancel');
                                populateUsers();
                                
                            })
                            .error(function(err,code) {
                                
                                    if(code==403)
                                    {
                                        $modalInstance.dismiss('cancel');
                                       $location.path("/"); 
                                    }
                                    else
                                    $scope.duplicate.email=true;
                            });
                    	}
                    };
                    
                    
                    
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });

    	}





     $scope.editUser = function(id) {
            var modalInstance = $modal.open({
                templateUrl  : 'components/backoffice/user/views/user-edit.html',
                size : 'lg',
                controller   : function($scope,$modalInstance,$location) {
                    $scope.required = {};
                    $scope.duplicate = {};
                    $scope.valide = {email:true};
                    $scope.copieCompanies = {};
                    $scope.user;

                    UserSvc.findOne(id).success(function(user){
                        $scope.user = user;
                    })

                   

                    $scope.save = function() {
                        $scope.required.email = !$scope.user || !$scope.user.email ||!$scope.user.email.trim().length;
                        $scope.required.firstName = !$scope.user || !$scope.user.firstName ||!$scope.user.firstName.trim().length;
                        $scope.required.lastName = !$scope.user || !$scope.user.lastName ||!$scope.user.lastName.trim().length;           
                        
                         
                        if (!$scope.required.email &&  !$scope.required.firstName && !$scope.required.lastName && !$scope.required.password) {
                        
                            $scope.user.companies = _.pluck($scope.user.companies,'_id')
                            UserSvc.edit($scope.user).success(function () {
                                $modalInstance.dismiss('cancel');
                                populateUsers();
                            })
                           .error(function(err,code) {
                                    if(code==403)
                                    {
                                        $modalInstance.dismiss('cancel');
                                       $location.path("/"); 
                                    }
                                    else
                                      $scope.duplicate.email=true;
                            });
                        }
                    };

                    function getRoles(){
                         RoleSvc.findAll().success(function(response){
                            $scope.roles=response;
                        });
                    }

                    function getCompanies(){
                         CompanySvc.findAll().success(function(response){
                            $scope.companies = response;
                            $scope.copieCompanies = angular.copy($scope.companies);
                            $scope.filter();

                        });
                    }

                   
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

        $scope.deleteUser = function(id) {
            var modalInstance = $modal.open({
                templateUrl  : 'components/backoffice/user/views/user-delete.html',
                controller   : function($scope,$modalInstance,$location) {

                    UserSvc.findOne(id).success(function(user){
                        $scope.user = user;
                    })

                    $scope.save = function() {
                        UserSvc.delete(id).success(function(){
                            $modalInstance.dismiss('cancel');
                            populateUsers();
                        })
                        .error(function(err,code) {
                                    if(code==403)
                                    {
                                        $modalInstance.dismiss('cancel');
                                       $location.path("/"); 
                                    }
                                    else
                                    $scope.duplicate.email=true;
                            });
                    };

                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };      

       
 })