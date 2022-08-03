var gridSize=20, unitSize=20;
var snakeX=snakeY=10, xVel=yVel=0, length=5;
var aX=aY=15, apple; 
var snake=[], score=0;

var keyPresses=[];
var refreshRate= 1000/18, gamePlayed=false;
var interval, canvas, context, sizeInterval;
var playing=false, paused=false;

var codes = ["ArrowLeft","ArrowUp","ArrowRight","ArrowDown","KeyW","KeyA","KeyD","KeyS"]

var bgMusic, gameOverSound, pickUpSound, sounds=true;
var toggle=true, musicLoadInterval;

var apples = []

$(document).ready(function(){
    var dateObj = new Date()
    if(id==chika&&(dateObj.getDate()>12|dateObj.getMonth()>3||dateObj.getFullYear()>2022))makeFudailChanges()

    $("#left").mousedown(function(){keyPush({code:"ArrowLeft"})})
    $("#up").mousedown(function(){keyPush({code:"ArrowUp"})})
    $("#right").mousedown(function(){keyPush({code:"ArrowRight"})})
    $("#down").mousedown(function(){keyPush({code:"ArrowDown"})})
    $("#play").mousedown(function(){keyPush({code:"Space"})})
    $("#logout").click(function(){location.href="/logout"})
    $("#settings").click(function(){if(toggle)$("#actualSettings").toggle()})
    $('#apple,#default').click(function() {if($(this).is(':checked')) { udpateApplePref($(this).attr("id")) }});
    // $("#"+prefApple).prop("checked", true);

    canvas= document.getElementById("cvs");
    sizeInterval = setInterval(canvasSetup,refreshRate);
    context= canvas.getContext("2d");

    apple = new Image();
    if(prefApple=='apple')apple.src = '/Images/'+prefApple+'.png';
    else if(prefApple!='default') apple.src = '/Images/fudail/'+prefApple+'.png';

    bgMusic= document.getElementById("bg");
    bgMusic.volume=0.2

    gameOverSound= document.getElementById("go");
    pickUpSound= document.getElementById("pu");

    $("#music,#sounds,#vol,.appleSelection").click(function(){
        toggle=false;
        setTimeout(function(){toggle=true},50);
    })
    musicLoadInterval=setInterval(function(){
        if(bgMusic.readyState&&gameOverSound.readyState&&pickUpSound.readyState){
            $("#music,#sounds,#vol").on("input change",function(){
                if(document.getElementById("music").checked)bgMusic.play();
                else bgMusic.pause();
        
                sounds=document.getElementById("sounds").checked
                bgMusic.volume= parseInt(document.getElementById("vol").value)/10
            })
            clearInterval(musicLoadInterval)
        }
    },50)
})

function makeFudailChanges(){
    $("#logo").attr({
        src: '/Images/fudail/logo.png',
        width: '80px'
    });
    apples = ['bigRedRupee','bombosMedallion','fireElement', 'fireMedallion', 'heartContainer2','moonPearl', 'redKinstone',]

    for (let i = 0; i < apples.length; i++) {
        var newRadio = "<input type='radio' name='appleSelection' class='appleSelection' id='"+apples[i]+"'>"
        var newImage = "<img src='/Images/fudail/"+apples[i]+".png' width='20px' height='20px' style='position:relative;top:3px;margin:2px'>"
        var newSpan = "<span style='font-size:20px;position:relative;top:-5px' >   "+apples[i]+"</span>"
        $("#applePref").append("<br>",newRadio,newImage,newSpan); 

        $('#'+apples[i]).click(function() {
            toggle=false;
            setTimeout(function(){toggle=true},50);
            if($(this).is(':checked')) udpateApplePref($(this).attr("id")) 
        });
        
    }

    $("#ins1").html("You're an NPC. if you want to play, you need to be human")
    $("#ins2").html("If being an NPC meant that you're a good friend, then you are the biggest NPC ever. <3")
    $("#ins3").html("By the way, Zelda said hi <3")
    $("#ins4").html("Please floor it :(")
    $("#ins5").html("Actually don't :)")

    $(".upper").css("background", "#072c1d");
    $("body").css("background-color", "#072c1d");
    $(".controls, .tabs, #miscBox").css("border","#7ce9bc 1px solid")
    $(".scoreUpdates").css("background-color", "#7ce9bc");

    $(".controls, .tabs").hover(function(){
        $(this).css("background-color", "#7ce9bc");
        $(this).css("color", "black");
    },function(){
        $(this).css("background-color", "transparent");
        $(this).css("color", "white");
    })

    var audio = $("#bg");     
    $("#bgm").attr("src", '/Audio/zelda.mp3');
    audio[0].pause()
    audio[0].load()
    confirmChanges()
}

function updateGame(){
    paused=false

    if(apples.length!=0&&id!=chika)location.href="/logout"
    canvasSetup();
    drawEnv();
    snakeUpdates();
}
function canvasSetup(){
    unitSize=canvas.width/20;
    if($(document).height()/$(document).width()>=2){
        canvas.height=canvas.width=($(document).width()/1.1 - (($(document).width()/1.1)%20));
    }
    else{
        canvas.height=canvas.width=($(document).height()/2 - (($(document).height()/2)%20));
    }

    if(paused){
        drawEnv();
        snakeUpdates();
    }
    else if(interval==undefined&&!gamePlayed){
        context.fillStyle="black";
        context.fillRect(0,0,canvas.width,canvas.height);
        textInit()

        var dateObj = new Date()
        var prTe = "Press space to start the game"
        if(dateObj.getMonth()==3&&dateObj.getDate()==13&&id==chika)prTe="Happy birthday Fudail!"

        context.fillText(prTe,canvas.width/2,canvas.height/2);
        window.addEventListener("keydown",keyPush);
    }
    else if(!playing){
        context.fillStyle="black";
        context.fillRect(0,0,canvas.width,canvas.height);
        textInit()
        context.fillText("Game over",canvas.width/2,canvas.height/2-20);
        context.fillText("Score: "+ score,canvas.width/2,canvas.height/2+5);
        context.fillText("Press space to play again",canvas.width/2,canvas.height/2+30);
    }
}
function keyPush(e){
    if(e.code=="Space"){
        playPause();
        if(interval==undefined){
            if(!paused)keyPresses.push("ArrowRight");
            clearInterval(sizeInterval);
            gamePlayed=true
            interval= setInterval(
                function(){
                    updateGame();
                    changeDirection();
                },
                refreshRate
            );
        }
        else{
            clearInterval(interval)
            interval=undefined
            keyPresses=[]
        }
    }
    if(interval!=undefined&&codes.includes(e.code)){
        if(e.code=="KeyW")keyPresses.push("ArrowUp")
        else if(e.code=="KeyA")keyPresses.push("ArrowLeft")
        else if(e.code=="KeyD")keyPresses.push("ArrowRight")
        else if(e.code=="KeyS")keyPresses.push("ArrowDown")
        else keyPresses.push(e.code)
    }
}
function playPause(){
    playing=!playing
    if(playing){
        if(document.getElementById("music").checked)bgMusic.play()
        gameOverSound.pause();
        gameOverSound.currentTime=0;
        $("#play").html("Pause");
    }
    else{
        $("#play").html("Resume");
        paused=true;
        sizeInterval = setInterval(canvasSetup,refreshRate);
    } 
}
function drawEnv(){
    context.fillStyle="black";
    context.fillRect(0,0,canvas.width,canvas.height);


    if(prefApple=='default'){
        context.fillStyle="red";
        context.fillRect(aX*unitSize,aY*unitSize,unitSize-2,unitSize-2)
    }
    else context.drawImage(apple,aX*unitSize,aY*unitSize,unitSize,unitSize);

    context.fillStyle="white";
    context.font="20px monospace";
    context.textAlign="center";
    context.textBaseline="middle"
    if(id!=chika)context.fillText((length-5).toString(),canvas.width-15,15);

    $("#score").html("Score: "+(length-5))
}
function snakeUpdates(){
    if(!paused){
        snakeX+=xVel;
        snakeY+=yVel;
        wrapAround();
    }
    
    var endFlag=false;
    for(var i=0;i<snake.length;i++){
        if(aX==snake[i].x&&aY==snake[i].y)context.fillStyle= "rgba(0, 255, 0, 0.3)"
        else context.fillStyle="lime";
        context.fillRect(snake[i].x*unitSize,snake[i].y*unitSize,unitSize-2,unitSize-2);
        if(!paused&&snake.length>=5&&snake[i].x==snakeX&&snake[i].y==snakeY)endFlag=true;
    }
    if(endFlag)gameOver();


    if(!paused){
        if(aX==snakeX&&aY==snakeY){
            aX=Math.floor(Math.random()*gridSize);
            aY=Math.floor(Math.random()*gridSize);

            while(aX==19 && aY == 0){
                aX=Math.floor(Math.random()*gridSize);
                aY=Math.floor(Math.random()*gridSize);
            }

            length++;
            if(sounds)pickUpSound.play()
        }
        snake.push({x:snakeX,y:snakeY});
        while(snake.length>length)snake.shift();
    }
}
function changeDirection(){
    if(keyPresses.length==0)return;
    var code= keyPresses.pop();

    if(code=="ArrowLeft"&&xVel!=1){
        xVel=-1;
        yVel=0;
    }
    if(code=="ArrowUp"&&yVel!=1){
        xVel=0;
        yVel=-1;
    }
    if(code=="ArrowRight"&&xVel!=-1){
        xVel=1;
        yVel=0;
    }
    if(code=="ArrowDown"&&yVel!=-1){
        xVel=0
        yVel=1;
    }
}
function wrapAround(){
    if(snakeY<0)snakeY=gridSize-1;
    if(snakeX<0)snakeX=gridSize-1;
    if(snakeY>gridSize-1)snakeY=0;
    if(snakeX>gridSize-1)snakeX=0;
}
function gameOver(){
    score= length-5;
    sizeInterval = setInterval(canvasSetup,refreshRate);
    if(sounds){
        gameOverSound.play()
        bgMusic.pause()
    }
    clearInterval(interval);
    reset();
    scoreUpload();
}
function reset(){
    snakeX=snakeY=10;
    aX=aY=15; 
    xVel=yVel=0;
    snake=[];
    keyPresses=[];
    length=5;
    interval=undefined;
    $("#play").html("Start")
    playing=false;
}
function textInit(){
    context.font="15px monospace";
    context.fillStyle="white";
    context.textAlign="center";
    context.textBaseline="middle"
}
function scoreUpload(){
    if(highscore<score){
        $("#logs").html("Updating leaderboard...")
        $.post("/", {score:score},
            function(data,status){
                if(data.prompt=="error")location.href="/error"
                if(status!="success")$("#logs").html("Your score was not processed. Please sign out and sign in again...")
                else {
                    $("#logs").html("Leaderboard updated!")
                    $("#highscore").html("Highscore: "+(highscore= score))
                }
            }
        )
    }
    else $("#logs").html("...")
}
function udpateApplePref(aP){
    if(aP==prefApple)return;
    prefApple=aP
    if(prefApple=='apple')apple.src = '/Images/'+prefApple+'.png';
    else if(prefApple!='default') apple.src = '/Images/fudail/'+prefApple+'.png';

    $.post("/", {prefApple:prefApple},function(data,status){if(data == "lol")console.log("apple changed")})
}
function confirmChanges(){$.post("/confirmChanges", {},function(data,status){if(data == "con-firmed")location.href="/logout"})}