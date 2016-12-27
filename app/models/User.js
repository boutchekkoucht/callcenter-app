var bcrypt   = require('bcrypt-nodejs'),
    mongoosePaginate = require('mongoose-paginate');

module.exports = function(mongoose) {
    var Schema = mongoose.Schema,
        deepPopulate = require('mongoose-deep-populate')(mongoose);

    var UserSchema = new Schema({
        firstName: String,
        lastName: String,
        email : {type : String, unique : true},
        password: String
    });

    // generating a hash
    UserSchema.methods.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // checking if password is valid
    UserSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };

    UserSchema.plugin(mongoosePaginate);
    UserSchema.plugin(deepPopulate, {});

    module.exports = mongoose.model('User', UserSchema);
}
