var  _ =           require('underscore'),
    mongoose = require('mongoose'),
    AuthCtrl =  require('../controllers/authCtrl'),
    Response =  require('../helpers/response'),
    Client = mongoose.model('Client');

var routesApi = [
    {
        path: '/api/clients',
        httpMethod: 'GET',
        access: ['ADMIN','SUPER_ADMIN'],
        middleware: [function(req, res) {
            console.log("GET - /api/clients");
            return Client.find().exec(function(err,clients){
                if(!err) {
                    return Response.build(res,200,clients);
                } else {
                    return Response.build(res,500,err);
                }
            })
        }]
    },
    {
        path: '/api/clients',
        httpMethod: 'POST',
        access: ['ADMIN','SUPER_ADMIN'],
        middleware: [function(req, res) {
            console.log('POST - /api/clients',req.body);
            var client = new Client(req.body);
            client.save(function(err) {
                if(err) {
                    return Response.build(res,500,err);
                } else {
                    return Response.build(res,201);
                }
            });

        }]
    },
    {
        path: '/api/addRequest',
        httpMethod: 'POST',
        access: ['ADMIN','SUPER_ADMIN'],
        middleware: [function(req, res) {

            
            Client.findById(req.body.id).exec(function(err,client){
                if(err) {
                    return Response.build(res,500,err);
                } else {

                    client.requests.push(req.body.request);
                    
                    client.save(function(err) {
                        if(err) {
                            return Response.build(res,500,err);
                        } else {
                            return Response.build(res,201);
                        }
                    });
                }
            })
            

        }]
    },
    {
        path: '/api/clients/:id',
        httpMethod: 'PUT',
        access: ['ADMIN','SUPER_ADMIN'],
        middleware: [function(req, res) {
            console.log('PUT - /api/clients',req.body);
            return Client.findByIdAndUpdate(req.params.id, req.body, function (err, client) {
                if (err) {
                    return Response.build(res,500,err);
                } else if (!client) {
                    return Response.build(res,404,'Client not found');
                } else {
                    return Response.build(res,200);
                }
            })
        }]
    },
    {
        path: '/api/clients/:id',
        httpMethod: 'DELETE',
        access: ['ADMIN','SUPER_ADMIN'],
        middleware: [function(req, res) {
            
            return Client.findByIdAndRemove(req.params.id, function(err) {
                if(err) {
                    return Response.build(res,500,err);
                }  else {
                    return Response.build(res,200);
                }
            });
        }]
    },
    {
        path: '/api/clients/byphone/:phone',
        httpMethod: 'GET',
        middleware: [function(req, res) {
            
            Client.find({'phone' : req.params.phone}).exec(function(err,cleints){
                if(err) {
                    return Response.build(res,500,err.errors);
                }
                return Response.build(res,200,cleints);
            })
        }]
    }
]

module.exports = function(app) {

    _.each(routesApi, function(route) {
        route.middleware.unshift(function(req,res,next){AuthCtrl.ensureAuthorizedApi(req,res,next,routesApi)});
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

