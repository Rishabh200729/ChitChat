const mongoose  = require("mongoose");
const dotenv = require("dotenv").config();
//connect to db
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

const messageSchema = new mongoose.Schema({
	createdBy:String,
	msg:String,
	time:String,
	room:String
});
//create a model
const Msg = mongoose.model("Msg",messageSchema);
module.exports = Msg