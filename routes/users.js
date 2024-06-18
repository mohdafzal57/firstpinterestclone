const mongoose = require('mongoose');
const plm = require("passport-local-mongoose")
mongoose.connect("mongodb+srv://fs:pin123@cluster0.p990t1x.mongodb.net/") //mongodb+srv://faisalkhan:mohdafzalmongoatlas@cluster0.p990t1x.mongodb.net/
// mongoose.connect("mongodb://127.0.0.1:27017/pin") //mongodb+srv://faisalkhan:mohdafzalmongoatlas@cluster0.p990t1x.mongodb.net/

const userSchema = mongoose.Schema({
    username: String,
    fullname: String,
    email: String,
    password: String,
    profileImage: String,
    contact: Number,
    boards: {
        type: Array,
        default: []
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ]
})

userSchema.plugin(plm)
module.exports = mongoose.model("user", userSchema)