var mongoose     = require('mongoose'),
    _ =           require('underscore'),
    User = mongoose.model('User'),
    auth = require('../helpers/auth'),
    redisHelper = require('../helpers/redisHelper'),
    tokenHelper = require('../helpers/tokenHelper');

module.exports = {
    login: function(req, res, next) {
        if(req.body.email === global.CONFIG.superAdmin.email && req.body.password === global.CONFIG.superAdmin.password){
            var user = {
                "firstName": global.CONFIG.superAdmin.firstName,
                "lastName": global.CONFIG.superAdmin.lastName,
                "email" : global.CONFIG.superAdmin.email,
                "isSuperAdmin" : true
            }
            auth.createAndStoreToken(user, 60*60, function(err, token) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(400);
                }
                return res.json({token : token});
            });
        } else {
            return User.findOne({email : req.body.email})
                .exec(function(err,user){
                if(!err) {
                    if(!user) {
                        return res.status(404).end('Email not found');
                    }
                    else if(!user.validPassword(req.body.password)) {
                        return res.status(401).end('Wrong email or password');
                    }
                    else {
                        auth.createAndStoreToken(user, 60*60, function(err, token) {
                            if (err) {
                                console.log(err);
                                return res.sendStatus(400);
                            }
                            return res.json({token : token});
                        });
                    }
                }
                else {
                    console.log('ERROR',err);
                    return res.sendStatus(500);
                }
            });
        }
    },
    logout: function(req, res) {
        auth.expireToken(req.headers, function(err, success) {
            if (err) {
                console.log(err);
                return res.sendStatus(401);
            }

            if (success) res.sendStatus(200);
            else res.sendStatus(401);
        });
    },

    ensureAuthorizedApi: function(req,res,next,routes) {
        var route = _.findWhere(routes,{path : req.route.path,httpMethod : req.route.stack[0].method.toUpperCase()});

        if(route.require && route.require.token){
            var headers = req.headers;
            if (headers == null) return res.sendStatus(401);

            // Get token
            try {
                var token = tokenHelper.extractTokenFromHeader(headers);
            } catch (err) {
                console.log(err);
                return res.sendStatus(401);
            }

            //Verify it in redis, set data in req._user
            redisHelper.getDataByToken(token, function(err, data) {
                if (err) return res.sendStatus(401);
                if(!data.isSuperAdmin){
                    User.findById(data._id)
                        .exec(function(err,user){
                        if(!err){
                            req._user = user.toObject();
                            // if route.access is undefined so the route is public
                            next();
                        }
                    });
                } else {
                    req._user = data;
                    next();
                }
            });
        } else {
            return next();
        }
    }
};
