const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/blurtalk`);

const userschema = mongoose.Schema({
    name:String,
    username:String,
    email:String,
    age:Number,
    post:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'
        }
    ],
    password:String
});

module.exports = mongoose.model("user",userschema);