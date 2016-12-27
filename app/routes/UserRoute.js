var bcrypt   = require('bcrypt-nodejs'),
    mongoose = require('mongoose'),
    _ =           require('underscore'),
    fs =           require('fs'),
    path =           require('path'),
    AuthCtrl =  require('../controllers/authCtrl'),
    Response =  require('../helpers/response'),
    User = mongoose.model('User');

var routesApiUser = [
    {
        path: '/api/users/:page/:limit',
        httpMethod : 'POST',
        require : {
            superAdmin: false,
            token : true,
            rights : ["GET_USER"]
        },
        middleware: [function(req, res) {
            console.log("GET - /api/users/:page/:limit",req.params.page,req.params.limit,req.body)
            return User.paginate({}, {
                page: req.params.page,
                limit: parseInt(req.params.limit),
            }, function(err, users, totalPages, totalItems){
                if(!err) {
                    return Response.build(res,200,{data : users, count : totalItems});
                } else {
                    return Response.build(res,500,err);
                }
            });
        }]
    },
    {
        path: '/api/users',
        httpMethod: 'GET',
        require : {
            superAdmin: false,
            token : true,
            rights : ['GET_USER']
        },
        middleware: [function(req, res) {
            console.log("GET - /api/users");
            return User.find()
                .exec(function(err,users){
                if(!err) {
                    return Response.build(res,200,users);
                } else {
                    return Response.build(res,500,err);
                }
            })
        }]
    },
    {
        path: '/api/users',
        httpMethod: 'POST',
        require : {
            superAdmin: false,
            token : true,
            rights : ['POST_USER']
        },
        middleware: [function(req, res) {
            console.log('POST - /api/users',req.body);
            var user = new User(req.body);
            user.password = user.generateHash(req.body.password);
            user.save(function (err) {
                if (err) {
                    return Response.build(res,500,err);
                } else {
                    return Response.build(res,201);
                }
            });
        }]
    },
    {
        path: '/api/users/:id',
        httpMethod: 'PUT',
        require : {
            superAdmin: false,
            token : true,
            rights : []
        },
        middleware: [function(req, res) {
            console.log('PUT - /api/users',req.body);
            var password = "";
            if(!req.body.password) {
                delete req.body.password
            } else {
                password = req.body.password;
                req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
            }
            return User.findByIdAndUpdate(req.params.id, req.body, {new : false}, function (err, user) {
                if (err) {
                    return Response.build(res,500,err);
                } else if (!user) {
                    return Response.build(res,404,'user Not found');
                } else {
                    return Response.build(res,200);
                }
            })
        }]
    },
    {
        path: '/api/users/:id',
        httpMethod: 'GET',
        require : {
            superAdmin: false,
            token : true,
            rights : []
        },
        middleware: [function(req, res) {
            console.log("GET - /api/users/:id/:populate?");
            User.findById(req.params.id).exec(function(err, user) {
                if(err) {
                    return Response.build(res,500,err);
                } else if(!user) {
                    return Response.build(res,404,'user not found');
                } else {
                    return Response.build(res,200,user);
                }
            });
        }]
    },
    {
        path: '/api/users/:id',
        httpMethod: 'DELETE',
        require : {
            superAdmin: false,
            token : true,
            rights : ['DELETE_USER']
        },
        middleware: [function(req, res) {
            console.log("DELETE - /api/users/:id");
            return User.findByIdAndRemove(req.params.id, function(err, user) {
                if(err) {
                    return Response.build(res,500,err);
                } else if(!user) {
                    return Response.build(res,404,'user Not found');
                } else {
                    return Response.build(res,200);
                }
            });
        }]
    }
]

module.exports = function(app) {

    _.each(routesApiUser, function(route) {
        route.middleware.unshift(function(req,res,next){AuthCtrl.ensureAuthorizedApi(req,res,next,routesApiUser)});
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

