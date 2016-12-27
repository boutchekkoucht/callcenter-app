angular
    .module('MainApp',
        [
            'ui.router', 'ngResource', 'ngCookies','ui.bootstrap','gettext','ngSanitize','toggle-switch','ui.select'
        ]
    )
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        $locationProvider.html5Mode(true);

        $httpProvider.interceptors.push('TokenInterceptor');

        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'components/partials/home/home.html',
                require: {
                    superAdmin : false,
                    rights : []
                }
            })
            // Admin Application
            .state('admin', {
                url: '/admin',
                templateUrl: 'components/backoffice/admin/views/admin.html',
                controller: 'AdminCtrl',
                require: {
                    superAdmin : true,
                    rights : []
                }
            })
            .state('admin.config', {
                url: '/config',
                templateUrl: 'components/backoffice/config/views/config.html',
                controller: 'ConfigCtrl',
                require: {
                    superAdmin : true,
                    rights : []
                }
            })
            .state('admin.users', {
                url: '/users',
                templateUrl: 'components/backoffice/user/views/users.html',
                controller: 'UserCtrl',
                require: {
                    superAdmin : false,
                    rights : ['GET_USER']
                }
            })
            .state('client', {
                url: '/client',
                templateUrl: 'components/frontoffice/client/views/clients.html',
                controller: 'ClientCtrl',
                require: {
                    superAdmin : false,
                    rights : []
                }
            })
            .state('history', {
                url: '/history-requests',
                templateUrl: 'components/frontoffice/client/views/client-show.html',
                controller: 'ClientHisCtrl',
                require: {
                    superAdmin : false,
                    rights : []
                }
            })
           
    })
    .run(function($rootScope, $location , SettingService, SessionStorageService, Auth, UserModel) {

        SettingService.translator.setLang();
        SettingService.populateRootScope();

        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if(SessionStorageService.get('token')){
                Auth.isAlive().success(function(user){
                    
                    $rootScope.currentUser = UserModel.bootstrap(user);
                })
            }
        });
    });