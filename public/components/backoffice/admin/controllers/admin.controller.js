angular
    .module('MainApp')
    .controller('AdminCtrl', function($rootScope,$cookieStore,gettextCatalog,$scope,$state,Auth) {




        var user = {};
        $scope.currentState = $state.current;

        $rootScope.$on('translateChangeSuccess', function () {
            buildMenus();
        });

        function buildMenus() {
            var menus = [
                {
                    icon : 'fa fa-user fa-fw',
                    title : gettextCatalog.getString('Users'),
                    state : 'admin.users',
                    require: {
                        superAdmin : false,
                        rights : ['GET_USER']
                    }
                }/*,
                {
                    icon : 'fa fa-wrench fa-fw',
                    title : gettextCatalog.getString('Config'),
                    state : 'admin.config',
                    require: {
                        superAdmin : true,
                        rights : []
                    }
                }*/
            ];

            $scope.menus = menus;
        };


        Auth.isAlive().success(function(u){
            user = u;
            if(!u.isSuperAdmin)
                $state.go('client');
            buildMenus();
        });


    });