module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    var ClientSchema = new Schema({
        firstName:    String,
        lastName:  String,
        email:  String,
        phone:  String,
        requests:   [
            {
              agent: {type: Schema.Types.ObjectId, ref: 'User'},
              typeReq : String,
              request : String,
              createdAt :  {type : Date,default :Date.now}
            }
        ]
        
    });

    module.exports = mongoose.model('Client', ClientSchema);
}
