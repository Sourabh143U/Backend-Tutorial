import express from 'express';
import path from "path";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const DB_URL = "mongodb+srv://sourabhugawekar2704:Nt2qZqy1nqRS7eNe@cluster0.pczchia.mongodb.net/";
const app = express();
// const user = [];


// Connection the database
mongoose.connect(DB_URL, { dbName: "authForm" }).then(() => console.log("Database Connected")).catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password:String
});

const User = mongoose.model("User", userSchema);

// app.get("/add", async (req,res) => {
//    await User.create({name:"Chris",email:"chirs.gayle@gmail.com"});
//     res.send("Nice");   
// });


// using the middleware 
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
// console.log(path.join(path.resolve(),"public"));

const isAuthenticator = async (req,res,next)=>{
    const {token} = req.cookies;
    if(token){

        const decoded = jwt.verify(token,"dfohsadofdfdf");
        req.user = await User.findById(decoded._id);
        console.log(decoded);
        next();
    }
    else{
        res.redirect("/login");
    }
}

app.set("view engine", "ejs");

app.get("/",isAuthenticator, (req, res) => {
    // console.log("get in statement")
    console.log(req.user);
    res.render("logout",{name:req.user.name});
    // res.sendFile("index.html") ;
});

app.get("/login",(req,res) => {
    res.render("login");
})
app.get("/register",(req,res) => {
    res.render("register");
})

app.post("/login", async (req,res) => {
    const {email,password} = req.body;
    let user = await User.findOne({email});

    if(!user){
        console.log("not get the user")
        return res.redirect("/register");
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        console.log("incorrect password");  
        return res.render("login",{message:"Incorrect Message"});
    }

    const token = jwt.sign({_id:user._id},"dfohsadofdfdf");
    console.log(token);
    res.cookie("token",token,user._id,{
        httpOnly:true,
        expires:new Date(Date.now() + 60*1000)
    });
    res.redirect("/");

});

app.post("/register",async(req,res) =>{
    const {name,email,password} = req.body;
    
    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password,10);

    user = await User.create({
        name,
        email,
        password:hashedPassword,
    }); 

    const token = jwt.sign({_id:user._id},"dfohsadofdfdf");
    console.log(token);

    res.cookie("token",token,user._id,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000)
    });
    res.redirect("/");
});

app.get("/logout",(req,res) =>{
    res.cookie("token","",{
        httpOnly :true,
        expires:new Date(Date.now())
    })
    res.redirect("/");
})




/** 
 * 
 * 
 * This is a success and Contact Page

app.get("/success", (req, res) => {
    res.render("success");
});

app.post("/contact", async (req, res) => {
    const {name,email} = req.body;  
    await User.create({
        name,//req.body.name
        email //req.body.email
    });
 
    res.redirect("/success");
});

app.get("/users", (req, res) => {
    res.json({
        user,
    });
})  
*/
app.listen(5000, () => {
    console.log("Server is starting ");
});