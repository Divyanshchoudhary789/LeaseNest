const { required } = require("joi");
const mongoose = require("mongoose");
const Schema =  mongoose.Schema;

const messageSchema = new Schema({
    sender:{
        type: String,
        enum:["user","assistant"],
        required:true
    },

    text:{
        type: String,
        required:true,
        trim: true
    },

    timestamp:{
        type: Date,
        default: Date.now
    }

});


const chatSessionSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required: false
    },

    sessionId:{
        type: String,
        required: true,
        unique: true
    },

    title:{
        type: String,
    },

    messages:{
        type: [messageSchema],
        default: []
    },

    createdAt:{
        type: Date,
        default: Date.now
    },

});


const ChatSession = mongoose.model("ChatSession",chatSessionSchema);

module.exports = ChatSession;