angular
    .module('MainApp')
    .controller('NavCtrl', function($scope,$rootScope,$state, $modal, $window, Auth , gettextCatalog , SessionStorageService, UserSvc) {

        var mainMenus = [
            {
                icon : 'fa fa-sliders',
                title:  gettextCatalog.getString('ADMIN'),
                state: 'admin',
                require: {
                    superAdmin : true,
                    rights : []
                }
            },
            {
                icon : 'fa fa-sliders',
                title:  gettextCatalog.getString('NEW REQUEST'),
                state: 'client',
                require: {
                    superAdmin : false,
                    rights : []
                }
            },
            {
                icon : 'fa fa-sliders',
                title:  gettextCatalog.getString('CLIENT HISTORY'),
                state: 'history',
                require: {
                    superAdmin : false,
                    rights : []
                }
            }
        ];

        getUserInfos(buildMenus);
        $scope.isVisible = function(req){
            
            if($rootScope.currentUser){
                 if($rootScope.currentUser.isSuperAdmin && req.superAdmin )
                    return true;
                if(!$rootScope.currentUser.isSuperAdmin && !req.superAdmin )
                    return true;
               
            }
             return false;
               
        } 
        function buildMenus() {
            if(SessionStorageService.get('token')){
                $scope.mainMenus = mainMenus;
            } else {
                $scope.mainMenus = [];
            }

        };

        function getUserInfos(cb){
            if(SessionStorageService.get('token')){
                Auth.isAlive().success(function(user){
                    $scope.user = user;
                    cb();
                });
            }
            else {
                $scope.user = {};
                cb();
            }
        }

        $rootScope.$on("loginlogout", function () {
            getUserInfos(buildMenus);
        });
        $rootScope.$on("editAccount", function () {
            getUserInfos(buildMenus);
        });

        $rootScope.$on('translateChangeSuccess', function () {
            buildMenus();
            $scope.currentLanguage =  SessionStorageService.get('lang');
        });

        $scope.logout = function() {
            if(SessionStorageService.get('token')){
                Auth.logout(function() {
                    SessionStorageService.delete('token');
                    $rootScope.$broadcast("loginlogout", {});
                    $state.go('home');
                }, function() {
                        $rootScope.error = gettextCatalog.getString('Invalid credentials');
                });
            }
        };

        $scope.editUser = function(id) {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/user/views/user-account.html',
                size : 'lg',
                controller: function ($scope, $modalInstance) {

                    UserSvc.findOne(id).success(function(user){
                        delete user.password;
                        $scope.user = user;
                    })

                    $scope.save = function () {
                        UserSvc.edit($scope.user).success(function(){
                            $rootScope.$broadcast("editAccount", {})
                            $modalInstance.dismiss('cancel');
                        })
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

        $scope.currentLanguage =  SessionStorageService.get('lang');

        $scope.changeLanguage = function (langKey) {
            gettextCatalog.setCurrentLanguage(langKey);
            SessionStorageService.put('lang' , langKey);
            $rootScope.$broadcast("translateChangeSuccess", {});
        };


    }
);