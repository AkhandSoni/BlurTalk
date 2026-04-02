const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const bcrypt = require("bcrypt");

const usermodel = require("./models/user");
const postmodel = require("./models/post");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(cookieparser());

function IsLoggedIn(req, res, next){
    let token = req.cookies.token;
    if(!token){
        return res.redirect("/login");
    }
    else{
        try{
            let user = jwt.verify(token,"secret");
            req.user=user;
            next();
        }catch(err){
            return res.redirect("/login");
        }
    }
}

app.get("/",(req,res)=>{
    res.render("index");
});
app.get("/register",(req,res)=>{
    res.render("register");
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/feed",IsLoggedIn,async (req,res)=>{
    let posts = await postmodel.find().sort({createdAt:-1});
    let users = await usermodel.find();
    let usermap = {};
    users.forEach(u => {
        usermap[u._id]=u.username;
    });
    res.render("feed",{posts:posts,users:users,cuser:req.user.userid,usermap:usermap}); 
});
app.get("/profile",IsLoggedIn,async (req,res)=>{
    let user = await usermodel.findOne({email:req.user.email});
    let posts = await postmodel.find({user:user._id});  
    res.render("profile",{user:user,posts:posts});
});
app.get("/like/:pid", IsLoggedIn, async (req,res)=>{
    let post = await postmodel.findOne({_id:req.params.pid});
    let uid = req.user.userid;
    if (post.likes.indexOf(uid)===-1) {
        post.likes.push(uid);
    } else {
        post.likes.splice(post.likes.indexOf(uid),1)
    }
    await post.save();
    res.redirect(req.get("Referer"));
});
app.get("/logout",IsLoggedIn,(req,res)=>{
    res.clearCookie("token");
    res.redirect("/login");
});
app.get("/edit/:id",IsLoggedIn,(req,res)=>{
    let pid = req.params.id;
    let content = req.query.content;
    res.render("edit",{pid:pid,content:content})
})

app.post("/registernow",(req,res)=>{
    res.render("register");
});
app.post("/loginnow",(req,res)=>{
    res.render("login");
})
app.post("/register",async (req,res)=>{
    let {name,username,email,age,pass} = req.body;
    let user = await usermodel.findOne({email:email});
    if(!user){
        if(name&&username&&email&&age&&pass){
            await bcrypt.genSalt(10,async (err,salt)=>{
                await bcrypt.hash(pass,salt,async (err,hash)=>{
                    let hashpass=hash;
                    let user = await usermodel.create({
                        name:name,
                        username:username,
                        email:email,
                        age:age,
                        password:hashpass
                    });
                    let token = jwt.sign({email:email,userid:user._id},"secret");
                    res.cookie("token",token);
                    res.redirect("/feed");
                });
            });
        }
        else{res.redirect("/");}
    }
    else{
        return res.status(500).send("something went wrong...");
    }
});
app.post("/login",async (req,res)=>{
    let {email,pass} = req.body;
    let user = await usermodel.findOne({email});
    if(user){
        if(email&&pass){    
            bcrypt.compare(pass,user.password,(err,result)=>{
                if(result){
                    let token = jwt.sign({email:email,userid:user._id},"secret");
                    res.cookie("token",token);
                    res.status(200).redirect("/profile");
                }
            });
        }
        else{res.redirect("/login");}
    }
    else{
        return res.status(500).send("something went wrong...");
    }
})
app.post("/post",IsLoggedIn,async (req,res)=>{
    let {content} = req.body;
    let post =await postmodel.create({
        content:content,
        user:req.user.userid,
    });
    let user = await usermodel.findOne({email:req.user.email});
    user.post.push(post._id);
    await user.save();
    res.redirect(req.get("referer"));
});
app.post("/edit",IsLoggedIn,async (req,res)=>{
    let {pid,content} = req.body;
    let post =await postmodel.findOne({_id:pid});
    post.content = content;
    await post.save();
    res.redirect("/profile");
})

app.listen(3000,()=>{
    console.log("3000 in session");
});