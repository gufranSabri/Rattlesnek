var gridSize=20, unitSize=20;
var playerX=playerY=10, xVel=yVel=0, tail=5;
var appleX=appleY=15, apple; 
var trail=[], score=0;

var keyPresses=[];
var refreshRate= 1000/18, gamePlayed=false;
var interval, canvas, context, sizeInterval;
var playing=false, paused=false;

$(document).ready(function(){
    $("#left").mousedown(function(){keyPush({keyCode:37})})
    $("#up").mousedown(function(){keyPush({keyCode:38})})
    $("#right").mousedown(function(){keyPush({keyCode:39})})
    $("#down").mousedown(function(){keyPush({keyCode:40})})
    $("#play").mousedown(function(){keyPush({keyCode:32})})
    $("#logout").click(function(){location.href="/logout"})
    $("#settings").click(function(){$(this).html("Coming soon...")})

    canvas= document.getElementById("cvs");
    sizeInterval = setInterval(canvasSetup,refreshRate);
    context= canvas.getContext("2d");

    apple = new Image();
    apple.src = '/Images/apple.png';
})
function updateGame(){
    paused=false
    canvasSetup();
    drawEnv();
    snakeUpdates();
}
function canvasSetup(){
    unitSize=canvas.width/20;
    if($(document).height()/$(document).width()>=2)canvas.height=canvas.width=($(document).width()/1.1 - (($(document).width()/1.1)%20));
    else canvas.height=canvas.width=($(document).height()/2 - (($(document).height()/2)%20));

    if(paused){
        drawEnv();
        snakeUpdates();
    }
    else if(interval==undefined&&!gamePlayed){
        context.fillStyle="black";
        context.fillRect(0,0,canvas.width,canvas.height);
        textInit()
        context.fillText("Press space to start the game",canvas.width/2,canvas.height/2);
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
    if(e.keyCode==32){
        playPause();
        if(interval==undefined){
            keyPresses.push(39);
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
    if(interval!=undefined&&(e.keyCode==37||e.keyCode==38||e.keyCode==39||e.keyCode==40))keyPresses.push(e.keyCode)
}
function playPause(){
    playing=!playing
    if(playing){
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

    // context.fillStyle="red";
    // context.fillRect(appleX*unitSize,appleY*unitSize,unitSize-2,unitSize-2)

    context.drawImage(apple,appleX*unitSize,appleY*unitSize,unitSize,unitSize);

    context.fillStyle="white";
    context.font="20px monospace";
    context.textAlign="center";
    context.textBaseline="middle"
    context.fillText((tail-5).toString(),canvas.width-15,15);

    $("#score").html("Score: "+(tail-5))
}
function snakeUpdates(){
    if(!paused){
        playerX+=xVel;
        playerY+=yVel;
        wrapAround();
    }
    
    var endFlag=false;
    for(var i=0;i<trail.length;i++){
        context.fillStyle="lime";
        context.fillRect(trail[i].x*unitSize,trail[i].y*unitSize,unitSize-2,unitSize-2);
        if(!paused&&trail.length>=5&&trail[i].x==playerX&&trail[i].y==playerY)endFlag=true;
    }
    if(endFlag)gameOver();


    if(!paused){
        if(appleX==playerX&&appleY==playerY){
            appleX=Math.floor(Math.random()*gridSize);
            appleY=Math.floor(Math.random()*gridSize);
            tail++;
        }
        trail.push({x:playerX,y:playerY});
        while(trail.length>tail)trail.shift();
    }
}
function changeDirection(){
    if(keyPresses.length==0)return;
    var code= keyPresses.pop();

    if(code==37&&xVel!=1){
        xVel=-1;
        yVel=0;
    }
    if(code==38&&yVel!=1){
        xVel=0;
        yVel=-1;
    }
    if(code==39&&xVel!=-1){
        xVel=1;
        yVel=0;
    }
    if(code==40&&yVel!=-1){
        xVel=0
        yVel=1;
    }
}
function wrapAround(){
    if(playerY<0)playerY=gridSize-1;
    if(playerX<0)playerX=gridSize-1;
    if(playerY>gridSize-1)playerY=0;
    if(playerX>gridSize-1)playerX=0;
}
function gameOver(){
    score= tail-5;
    sizeInterval = setInterval(canvasSetup,refreshRate);
    clearInterval(interval);
    reset();
    scoreUpload();
}
function reset(){
    playerX=playerY=10;
    appleX=appleY=15; 
    xVel=yVel=0;
    trail=[];
    keyPresses=[];
    tail=5;
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