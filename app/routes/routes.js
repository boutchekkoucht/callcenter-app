var _ =           require('underscore'),
    path =      require('path'),
    AuthCtrl =  require('../controllers/authCtrl');

var routes = [
    {
        path: '/components/*',
        httpMethod: 'GET',
        middleware: [function (req, res) {
            var requestedView = path.join('./', req.url);
            console.log(requestedView)
            res.sendFile(requestedView);
        }]
    },
    {
        path: '/login',
        httpMethod: 'POST',
        middleware: [AuthCtrl.login]
    },
    {
        path: '/logout',
        httpMethod: 'POST',
        require : {
            superAdmin: false,
            token : true,
            rights : []
        },
        middleware: [AuthCtrl.logout]
    },
    {
        path: '/isAlive',
        httpMethod: 'GET',
        require : {
            superAdmin: false,
            token : true,
            rights : []
        },
        middleware: [function(req, res) {
           console.log("GET - /isAlive");
            if(req._user){
               return res.json(req._user);
            } else{
                return res.sendStatus(401);
            }

        }]
    },
    {
        path: '/*',
        httpMethod: 'GET',
        middleware: [function(req, res) {
            res.sendFile(path.resolve('./public/index.html'));
        }]

    }
];


module.exports = function(app) {

    _.each(routes, function(route) {
        if(route.path != '/login' && route.path != '/*')
            route.middleware.unshift(function(req,res,next){AuthCtrl.ensureAuthorizedApi(req,res,next,routes)});
        var args = _.flatten([route.path, route.middleware]);

        switch(route.httpMethod.toUpperCase()) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT':
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                throw new Error('Invalid HTTP method specified for route ' + route.path);
                break;
        }
    });

}