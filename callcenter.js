// modules =================================================
var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    _ = require('underscore');


// configuration ===========================================

var db = require('./config/db')();
mongoose.connect(db.url,db.options, function(err) {
    console.log(err ? err : 'Connected to Database');
});


// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

var initFile = require('./app/controllers/init');

initFile.config(mongoose,function(err){
    if(!err){

        var models = ['User','Config','Client'];


            //Inject Models
            _.each(models,function(model){
                require('./app/models/'+model)(mongoose);
            })

            //Inject Routes
            _.each(models,function(model){
                try{
                    require('./app/routes/'+model+'Route')(app);
                }
                catch(e){
                    console.log(model+'Route.js : ',e);
                }
            })

        require('./app/routes/routes.js')(app);

        if(global.CONFIG.seed){
            initFile.seed();
        }

        var router = express.Router();

        router.use(function(req, res, next) {
            next();
        });
        // start app ===============================================
        var port = global.CONFIG.server.node.port || 4000;
        app.listen(port);
        console.log('App on port ' + port);
    } else {
        console.log(err);
    }
});