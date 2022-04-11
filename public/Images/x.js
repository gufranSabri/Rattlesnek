function chikaWontFindThis(){
    if(id!='Tokururu'){
        console.log("Only Fudail can access this. Also stop snooping >:(")
        return;
    }

    $("#logo").attr({
        src: '/Images/fudail/logo.png',
        width: '80px'
    });
    var apples = ['bigRedRupee','bombosMedallion','fireElement', 'fireMedallion', 'heartContainer2','moonPearl', 'redKinstone',]

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
    // audio[0].play()
}