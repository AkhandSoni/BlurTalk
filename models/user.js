const mongoose = require("mongoose"); // Import the mongoose library to interact with MongoDB

mongoose.connect(`mongodb://127.0.0.1:27017/blurtalk`);  // Connect to MongoDB database named "blurtalk"

const userschema = mongoose.Schema({  // Define the schema for the "user" collection in MongoDB in json format
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

module.exports = mongoose.model("user",userschema); // Export the model for the "user" collection based on the defined schema using mongoose.model()