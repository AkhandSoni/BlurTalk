const mongoose = require("mongoose");

const postschema = mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
    date:{
        type:Date,
        default:Date.now
    },
    likes:[
        {
            type:mongoose.Types.ObjectId,
            ref:'user'
        }
    ]
});

module.exports = mongoose.model("post",postschema);