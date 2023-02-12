import mongoose from "mongoose";

// Define the fieldtype of properties of document here using "scheme()".
const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    // email shoul be unique for all the users.
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    content: {type: String}
});

const user = mongoose.model("User", userSchema);

export default user;