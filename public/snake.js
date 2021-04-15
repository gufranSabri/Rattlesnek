var gridSize=20, unitSize=20;
var snakeX=snakeY=10, xVel=yVel=0, length=5;
var aX=aY=15, apple; 
var snake=[], score=0;

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
    if(interval!=undefined&&(e.keyCode==37||e.keyCode==38||e.keyCode==39||e.keyCode==40||e.keyCode==87||e.keyCode==65||e.keyCode==68||e.keyCode==83)){
        if(e.keyCode==87)keyPresses.push(38)
        else if(e.keyCode==65)keyPresses.push(37)
        else if(e.keyCode==68)keyPresses.push(39)
        else if(e.keyCode==83)keyPresses.push(40)
        else keyPresses.push(e.keyCode)
    }
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
    // context.fillRect(aX*unitSize,aY*unitSize,unitSize-2,unitSize-2)

    context.drawImage(apple,aX*unitSize,aY*unitSize,unitSize,unitSize);

    context.fillStyle="white";
    context.font="20px monospace";
    context.textAlign="center";
    context.textBaseline="middle"
    context.fillText((length-5).toString(),canvas.width-15,15);

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
        context.fillStyle="lime";
        context.fillRect(snake[i].x*unitSize,snake[i].y*unitSize,unitSize-2,unitSize-2);
        if(!paused&&snake.length>=5&&snake[i].x==snakeX&&snake[i].y==snakeY)endFlag=true;
    }
    if(endFlag)gameOver();


    if(!paused){
        if(aX==snakeX&&aY==snakeY){
            aX=Math.floor(Math.random()*gridSize);
            aY=Math.floor(Math.random()*gridSize);
            length++;
        }
        snake.push({x:snakeX,y:snakeY});
        while(snake.length>length)snake.shift();
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
    if(snakeY<0)snakeY=gridSize-1;
    if(snakeX<0)snakeX=gridSize-1;
    if(snakeY>gridSize-1)snakeY=0;
    if(snakeX>gridSize-1)snakeX=0;
}
function gameOver(){
    score= length-5;
    sizeInterval = setInterval(canvasSetup,refreshRate);
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