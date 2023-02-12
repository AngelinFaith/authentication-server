import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/authModels.js"

export const registerRoute = async(req, res)=>{
    const registrationData = req.body // {name: ...,email:...., password:...}
    const newPassword = await bcrypt.hash(req.body.password, 10); // Need to encrypt the password using bcrypt.hash(), by addding 10 to the password it bacanme the strong password.
    // Now replace the encrypted password in the password and stored it.
    const encryptedData = {...registrationData, password: newPassword};
    try{
        const registeredData = new User(encryptedData);
        await registeredData.save();
        res.status(200).json({success: true,data: registeredData, msg: "user register successfully"})
    } catch(error){
        res.status(400).json({success: false, error: error ,msg: "Something went wrong"})
    }
}

export const loginRoute = async(req, res)=>{
    try{
        const {email, password}= req.body;
        // Email is the unique one here, thus we used email to find the user from DB.
        // Using findOne(), we are searching for the user with email id which user enters in frontend.
        const user = await User.findOne({email: email});
        if(!user){
            return res.status(400).json({success: true, msg: `User with email: ${email} not found`})
        }
        // Checking whether the password from user during login and the user password stored in collection matches here.
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(isPasswordValid){
            // Generating a token while user login, and the email and password matches. Then generate a token with user name and email with the secret code.
            const token = jwt.sign({name: user.name, email: user.email}, process.env.KEY);
            return res.status(200).json({success: true, token: token, msg: "User verified successfully"})
        } else{
            return res.status(400).json({success: fals, msg: "Invalid password"})
        }
    } catch(error){
        res.status(400).json({success: false, error: error ,msg: "Something went wrong"})
    }
}

//This postContentRoute stores the user info in the db and getContentRoutse gets the content from db ad display in dashboard.
// Here only the registerd jwt users can able to access the dashboard..
export const getContentRoute = async(req, res)=>{
     const token =  req.headers["x-access-token"];
     try{
        const decoded = jwt.verify(token, process.env.KEY );
        const email = decoded.email;
        // This user holds the document of the specfic email id.
        const user = await User.findOne({email: email});
        return res.status(200).json({success: true, content: user.content});
     } catch(error){
        return res.status(400).json({success: false, msg: "Invalid jwt token"});
     }
}

// 
export const postContentRoute = async(req, res)=>{
    // Add a object headers with the property of "x-access-token". This has the jwt-generated-code
    const token = req.headers["x-access-token"]; // const headers = {x-access-token: "jwt_generator"}
    try{
        // we pass token and the secret code we generated in env file. By using the secret code, we are decrypt the token from frontend.
        // During login, we generated a token, here we decoded that token with secret code.
        // After decrypted, we get an object like below
        const decoded = jwt.verify(token, process.env.KEY ); // {"name": "Angel","email": "angel@gmail.com","iat": 1676114132 }
        // As email is unique, we are going to get some object from db using email.
        const email = decoded.email;
        // $set is the property of mongoDB. using this we can update the existing property present in db.
        // Here, we are going to get the document(object) with the email which is matched, along with the object we add a "content"
        // property using "set". This "content property holds the value users enters from frontend.
        await User.updateOne({email: email}, {$set: {content: req.body.content}});
        return res.status(200).json({success: true, msg: "Content added successfully"});
    } catch (error) {
        return res.status(400).json({success: false, msg: "Invalid jwt token"});
    }
} 