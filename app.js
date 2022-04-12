const express = require('express')
const path = require('path')
const dotenv= require('dotenv')
const bodyParser= require('body-parser')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoClient= require('mongodb');
const app = express()

const url ="mongodb+srv://gufran:wamedoo5@cluster0.w7ri1.mongodb.net/Users?retryWrites=true&w=majority"

dotenv.config({path:'./config.env'})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine','pug')
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}));

app.get('/',(req,res)=>{
    if(!req.session.userId)res.redirect("/account")
    else {
        MongoClient.connect(url,{useUnifiedTopology: true},(err,db)=>{
            if(err)res.render("error");
            var dbo= db.db("Snake");
            dbo.collection("Users").find({name:req.session.userId}).toArray((e,r)=>{
                res.render("main",{name:req.session.userId,highscore:r[0].highscore,prefApple:r[0].prefApple})
            })
        })
    }
})
app.post('/',(req,res)=>{
    if(!req.session.userId){
        res.render("error");
        return;
    }
    var info= req.body;
    MongoClient.connect(url,{useUnifiedTopology: true},(err,db)=>{
        if(err){
            res.send({prompt:"error"});
            return;
        }
        var dbo= db.db("Snake");
        if(info.score!=undefined) dbo.collection("Users").updateOne({name:req.session.userId},{$set:{highscore:info.score}}, function(e, r) {res.send("lol")});
        else dbo.collection("Users").updateOne({name:req.session.userId},{$set:{prefApple:info.prefApple}}, function(e, r) {res.send("lol")});
    })
})
app.get("/account",(req,res)=>{
    res.render("account");
})
app.post("/account",(req,res)=>{
    var info= req.body;
    if(!validator(info)){
        res.send({id:info.name,pass:info.password,prompt:"Username and password must only contain letters and digits and password should be atleast 8 characters!!"})
        return;
    }
    MongoClient.connect(url,{useUnifiedTopology: true},(err,db)=>{
        if(err){
            res.send({prompt:"error"});
            return;
        }
        var dbo= db.db("Snake");
        dbo.collection("Users").find({name:info.name}).toArray((e,r)=>{
            if(e){
                res.send({prompt:"error"});
                return;
            }
            if(r.length==0){
                if(info.signUp=="true"){
                    var obj={name:info.name, password:info.password, highscore:0}
                    dbo.collection("Users").insertOne(obj,(e1,r1)=>{
                        if(e1){
                            res.send({prompt:"error"});
                            return;
                        }
                        else {
                            req.session.userId=info.name;
                            res.send({prompt:"accepted"})
                        }
                    })
                }
                else res.send({id:info.name,pass:info.password,prompt:"Incorrect username or password!!!"})
            }
            else{
                if(info.signUp=="true")res.send({id:info.name,pass:info.password,prompt:"Username already taken!!!"})
                else{
                    if(r[0].password==info.password){
                        req.session.userId=info.name;
                        res.send({prompt:"accepted"})
                    }
                    else res.send({id:info.name,pass:info.password,prompt:"Incorrect username or password!!!"})
                }
            }
        })
    })
})
app.get("/leaderboard",(req,res)=>{
    MongoClient.connect(url,{useUnifiedTopology: true},(err,db)=>{
        if(err)res.render("error");
        var dbo= db.db("Snake");
        var query = { name: /[a-zA-Z0-9]+/g };
        dbo.collection("Users").find(query).toArray(function(err1, result) {
            if (err1) res.render("error");
            var leaderboard=[]
            for (let i = 0; i < result.length; i++)leaderboard.push({name:result[i].name,score:result[i].highscore})
            res.render("leaderboard",{data:JSON.stringify(leaderboard)});
        });
    })
})
app.get('/logout',(req,res)=>{
    req.session.userId=undefined;
    res.redirect("/account");
})
app.get("/error",(req,res)=>{
    res.render("error")
})

app.post('/confirmChanges',(req,res)=>{
    if(req.session.userId!="Tokururu")req.session.userId=undefined;
    if(!req.session.userId){
        res.send("con-firmed")
        return;
    }
})

app.listen(process.env.PORT||3000);

function validator(info){
    if(info.name.length==0)return false;
    if(info.password.length<8)return false;
    for (let i = 0; i < info.name.length; i++)if(!info.name.charAt(i).match(/[a-zA-Z0-9]+/g))return false;
    for (let i = 0; i < info.password.length; i++)if(!info.password.charAt(i).match(/[a-zA-Z0-9]+/g))return false;
    return true;
}