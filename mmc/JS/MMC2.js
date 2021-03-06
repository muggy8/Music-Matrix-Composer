var loginCookie;

function messageOff(){
    $("#infoGroup")[0].setAttribute("style", "display:none")
    document.getElementById("messageBody").innerHTML="";
    status="main";
    IntervalManager.clearAll();
    targetNote = 1;
    if (song.track0.instrument!=""){
        MIDI.programChange(0, instruments.indexOf(song.track0.instrument))
    }
	//console.log("turning off message");
}

function messageOn(m, func, button, buttonName){
    if (typeof func === 'undefined'){
        func="messageOff()";
    }
    if (typeof button === 'undefined'){
        button = true;
    }
    if (typeof buttonName === 'undefined'){
        buttonName = "Ok";
    }
    $("#infoGroup")[0].setAttribute("style", "")
    document.getElementById("messageBody").innerHTML=m;
    var btn = document.getElementById("confirm")
    btn.innerHTML=buttonName;
    btn.setAttribute("onclick", func);
    if (button){
        btn.style.display = "block";
    }
    else{
        btn.style.display = "none";
    }
    
    // if it just happens that a scale was displayed then do this to make stuff work
    $(".scaleInput").keyup(function (e) {
        if (e.keyCode == 13) {
            e.target.onchange();
        }
    });
}

function login(uNameID, uPassID){
    if(uNameID != null && uPassID != null){ 
        var uName= $("#" + uNameID)[0].value;
        var uPass= $("#" + uPassID)[0].value;
        $.post("services/login.php", {name: uName, pass: uPass}, function(data){
            //do somethin with data
            loginCookie = data;
            if (loginCookie.success){
                logSuccess();
                document.cookie=JSON.stringify(loginCookie);
            }
            else{
                messageOn(loginCookie.error);
            }
        }, "json")
    }
    else{
        //console.log("checking session");
        if ( document.cookie != ""){
            loginCookie = JSON.parse(document.cookie);
            //session check
            $.post("services/sessionCheck.php", {name: loginCookie.uName, sessionID:loginCookie.sessionID}, function(data){
                //alert(data);
                if (data){
                    logSuccess();
                }
            });
        }
    }
	loadInstrument("acoustic_grand_piano"/*, function(){
		for (var i = 1; i<instruments.length; i++){
			loadInstrument(instruments[i]);
		}
	}*/);
	getPublicSongs();
    return false;
}

function logSuccess(){
    $("#login").addClass("hide");
    $("#weba").removeClass("hide");
    $("#newUser").addClass("hide");
    $("#returningUser").removeClass("hide");
    var webaMessage = document.getElementsByTagName("h7")[0]
    webaMessage.innerHTML = webaMessage.innerHTML.replace("back", "back " + loginCookie.uName)
    getSavedSongs();
}

var savedSongs;
function getSavedSongs(){
    $.post("services/songList.php", {name: loginCookie.uName, sessionID:loginCookie.sessionID}, function(data){
        //console.log(data);
        savedSongs=JSON.parse(data);
        manifestData(savedSongs);
    });
}

function manifestData(songList){
    var songCount = Object.keys(songList).length;
    
    for (var i = songCount-1; i >= 0; i--){ //itterate through the list of songs backwards so you can get the newest ones first
        var songContainer = document.createElement("div");
		songContainer.className = "savedSong";
        document.getElementById("returningUser").appendChild(songContainer);
        
        var songTitle = document.createElement("h4");
        songTitle.innerHTML = songList["song" + i].name;
        songTitle.id = "song" + i + "-title";
        songContainer.appendChild(songTitle);
        
        var load = document.createElement("img");
		load.src = "img/icons/edit.png";
        load.title = load.alt ="Edit Song";
		load.width = 32;
		load.height = 32;
		//load.className = "controllButtons" 
        //load.setAttribute("type", "button");
        load.setAttribute("onclick", "loadSong('song" + i + "')");
        songContainer.appendChild(load);
        
        var rename = document.createElement("img");
		rename.src = "img/icons/rename.png";
        rename.title = rename.alt ="Rename";
		rename.width = 32;
		rename.height = 32;
		//rename.className = "controllButtons" 
        //rename.setAttribute("type", "button");
        rename.setAttribute("onclick", "renameStart('song" + i + "')");
        songContainer.appendChild(rename);
        
        var del = document.createElement("img");
		del.src = "img/icons/Delete.png";
        del.title = del.alt = "Delete Song"
        del.width = 32;
		del.height = 32;
		//del.className = "controllButtons" 
		//del.setAttribute("type", "button");
        del.setAttribute("onclick", "delConfirm('song" + i + "')");
        songContainer.appendChild(del);
        
        if (songList["song"+i].public){
            var share = document.createElement("img");
			share.src = "img/icons/link.png";
            share.title = share.alt = "Copy Share Link";
			share.width = 32;
			share.height = 32
			//share.className = "controllButtons" 
            //share.setAttribute("type", "button");
            share.setAttribute("onclick", "songLink('song" + i + "')");
            songContainer.appendChild(share);
        }
    }
    
}

function renameStart(target){
    messageOn("New name: <input type=\"text\" name=\"newName\" id=\"newName\">", "renameSong('" + target +  "')", true, "Rename" );
}

function renameSong(target){
	if (document.getElementById("newName").value != ""){
		savedSongs[target].name =  document.getElementById("newName").value;
		document.getElementById(target + "-title").innerHTML = document.getElementById("newName").value
		$.post("services/saveSong.php", {name:loginCookie.uName, sessionID:loginCookie.sessionID, data: JSON.stringify(savedSongs[target])}, function(data){
			//console.log(data);
			messageOff();
		});
	}
	else{
		messageOn("You cant use an empty title...");
	}
}

function delConfirm(songID){
    messageOn("Are you sure you want to delete this song?", "delSong('" + songID + "')", true, "Delete");
}

function delSong(songID){
    var target = savedSongs[target];
    $.post("services/delSong.php", {name:loginCookie.uName, sessionID:loginCookie.sessionID, songID: savedSongs[songID].songID}, function(data){
        console.log(data);
        location.reload();
    });
}

function logout(){
    var newCookie = {};
    newCookie["uName"]="";
    newCookie["sessionID"]=0;
    if (loginCookie[prompt !== undefined]){
        newCookie["prompt"] = loginCookie[prompt];
    }
    document.cookie='{"uName":"","sessionID":0,"prompt":true}';
    location.reload();
}

function registerAcc(){
    var uName = $("#desiredName")[0].value;
    var password1 = $("#pass1")[0].value;
    var password2 = $("#pass2")[0].value;
    
    if (password1 == password2 && pass1 != ""){
        $.post("services/newAccount.php", {name:uName, pass1: password1, pass2: password2}, function(data){
            //do something with return data\
            var jsondata = data;
            if (jsondata.success){
                document.cookie= JSON.stringify(data);
                //alert("Account created successful");
                login();
                document.getElementById("newUser").style.display = "none";
                messageOn("<p>Account created successfully</p>");
            }
            else{
                messageOn(jsondata.error);
            }
        }, "json")
    }
    else{
        messageOn("password must match and cannot be empty");
    }
   return false;
}

function songLink(savedIndex){
    var shareID = savedSongs[savedIndex].songID
    messageOn("<P>Share the following link for this song:</p><h3>https://mmc.mugdev.com/?song=" + shareID + "</h3>");
}

function publicLink(savedIndex){
    var shareID = publicRecentSongs[savedIndex].songID
    messageOn("<P>Share the following link for this song:</p><h3>https://mmc.mugdev.com/?song=" + shareID + "</h3>");
}

// ---------------------------------------------------------------
// account related functions ends here and pre-song related functions starts here
// ---------------------------------------------------------------

var scale = {"T1":73, "T2":70, "T3":68, "T4":66, "T5":63, "T6":61, "T7":58, "T8":56, "T9":54, "T10":51, "T11":49, "T12":46, "T13":44, "T14":42, "T15":39, "T16":37, "vol":127 };

var instruments = [ // use instruments.indexOf(nameOfInstrument);
    "acoustic_grand_piano", "bright_acoustic_piano", "electric_grand_piano", "honkytonk_piano", "electric_piano_1", "electric_piano_2", "harpsichord", "clavinet", //pianos
    "celesta", "glockenspiel", "music_box", "vibraphone", "marimba", "xylophone", "tubular_bells", "dulcimer", //Chromatic Percussion
    "drawbar_organ", "percussive_organ", "rock_organ", "church_organ", "reed_organ", "accordion", "harmonica", "tango_accordion", //Organ
    "acoustic_guitar_nylon", "acoustic_guitar_steel", "electric_guitar_jazz", "electric_guitar_clean", "electric_guitar_muted", "overdriven_guitar", "distortion_guitar", "guitar_harmonics", //guitars
    "acoustic_bass", "electric_bass_finger", "electric_bass_pick", "fretless_bass", "slap_bass_1", "slap_bass_2", "synth_bass_1", "synth_bass_2", //base
    "violin", "viola", "cello", "contrabass", "tremolo_strings", "pizzicato_strings", "orchestral_harp", "timpani", //strings
    "string_ensemble_1", "string_ensemble_2", "synth_strings_1", "synth_strings_2", "choir_aahs", "voice_oohs", "synth_choir", "orchestra_hit", //Ensemble
    "trumpet", "trombone", "tuba", "muted_trumpet", "french_horn", "brass_section", "synth_brass_1", "synth_brass_2", //Brass
    "soprano_sax", "alto_sax", "tenor_sax", "baritone_sax", "oboe", "english_horn", "bassoon", "clarinet", //Reed
    "piccolo", "flute", "recorder", "pan_flute", "blown_bottle", "shakuhachi", "whistle", "ocarina", //Pipe
    "lead_1_square", "lead_2_sawtooth", "lead_3_calliope", "lead_4_chiff", "lead_5_charang", "lead_6_voice", "lead_7_fifths", "lead_8_bass__lead", // synth leads
    "pad_1_new_age", "pad_2_warm", "pad_3_polysynth", "pad_4_choir", "pad_5_bowed", "pad_6_metallic", "pad_7_halo", "pad_8_sweep", //synth pads
    "fx_1_rain", "fx_2_soundtrack", "fx_3_crystal", "fx_4_atmosphere", "fx_5_brightness", "fx_6_goblins", "fx_7_echoes", "fx_8_scifi", // synth effects
    "sitar", "banjo", "bhamisen", "koto", "kalimba", "bagpipe", "fiddle","shanai", //ethnic
    "tinkle_bell", "agogo", "steel_drums", "woodblock", "taiko_drum", "melodic_tom", "synth_drum", "reverse_cymbal", //percussive
    "guitar_fret_noise", "breath_noise", "seashore", "bird_tweet", "telephone_ring", "helicopter", "applause", "gunshot" // sound effects
]

var baseVelocetys = [127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,127,15]

var presets =[//matrix presets
        {"preset": "Music Matrix A", "data":{"T1":73,"T2":70,"T3":68,"T4":66,"T5":63,"T6":61,"T7":58,"T8":56,"T9":54,"T10":51,"T11":49,"T12":46,"T13":44,"T14":42,"T15":39,"T16":37, "vol":127}},
        {"preset": "Music Matrix B", "data":{"T1":75,"T2":72,"T3":70,"T4":68,"T5":65,"T6":63,"T7":60,"T8":58,"T9":56,"T10":53,"T11":51,"T12":48,"T13":46,"T14":44,"T15":41,"T16":39, "vol":127}},
        {"preset": "Music Matrix C", "data":{"T1":76,"T2":73,"T3":71,"T4":69,"T5":66,"T6":64,"T7":61,"T8":59,"T9":57,"T10":54,"T11":52,"T12":49,"T13":47,"T14":45,"T15":42,"T16":40, "vol":127}},
        {"preset": "Music Matrix D", "data":{"T1":78,"T2":75,"T3":73,"T4":71,"T5":68,"T6":66,"T7":63,"T8":61,"T9":59,"T10":56,"T11":54,"T12":51,"T13":49,"T14":47,"T15":44,"T16":42, "vol":127}},
        {"preset": "Music Matrix E", "data":{"T1":80,"T2":77,"T3":75,"T4":73,"T5":70,"T6":68,"T7":65,"T8":63,"T9":61,"T10":58,"T11":56,"T12":53,"T13":51,"T14":49,"T15":46,"T16":44, "vol":127}},
        {"preset": "Music Matrix F", "data":{"T1":81,"T2":78,"T3":76,"T4":74,"T5":71,"T6":69,"T7":66,"T8":64,"T9":62,"T10":59,"T11":57,"T12":54,"T13":52,"T14":50,"T15":47,"T16":45, "vol":127}},
        {"preset": "Music Matrix G", "data":{"T1":83,"T2":80,"T3":78,"T4":76,"T5":73,"T6":71,"T7":68,"T8":66,"T9":64,"T10":61,"T11":59,"T12":56,"T13":54,"T14":52,"T15":49,"T16":47, "vol":127}},
        {"preset": "Music Matrix G#/Ab", "data":{"T1":73,"T2":70,"T3":68,"T4":66,"T5":63,"T6":61,"T7":58,"T8":56,"T9":54,"T10":51,"T11":49,"T12":46,"T13":44,"T14":42,"T15":39,"T16":37, "vol":127 }},
        {"preset": "Music Matrix A#/Bb", "data":{"T1":74,"T2":71,"T3":69,"T4":67,"T5":64,"T6":62,"T7":59,"T8":57,"T9":55,"T10":52,"T11":50,"T12":47,"T13":45,"T14":43,"T15":40,"T16":38, "vol":127}},
        {"preset": "Music Matrix C#/Db", "data":{"T1":77,"T2":74,"T3":72,"T4":70,"T5":67,"T6":65,"T7":62,"T8":60,"T9":58,"T10":55,"T11":53,"T12":50,"T13":48,"T14":46,"T15":43,"T16":41, "vol":127}},
        {"preset": "Music Matrix D#/Eb", "data":{"T1":79,"T2":76,"T3":74,"T4":72,"T5":69,"T6":67,"T7":64,"T8":62,"T9":60,"T10":57,"T11":55,"T12":52,"T13":50,"T14":48,"T15":45,"T16":43, "vol":127}},
        {"preset": "Music Matrix F#/Gb", "data":{"T1":82,"T2":79,"T3":77,"T4":75,"T5":72,"T6":70,"T7":67,"T8":65,"T9":63,"T10":60,"T11":58,"T12":55,"T13":53,"T14":51,"T15":48,"T16":46, "vol":127}},
        
        // drum kits and stuff
        
        {"preset": "Drum Kit Lower Range", "data":{"T1":42,"T2":41,"T3":40,"T4":39,"T5":38,"T6":37,"T7":36,"T8":35,"T9":34,"T10":33,"T11":32,"T12":31,"T13":30,"T14":29,"T15":28,"T16":27, "vol":127}},
        {"preset": "Drum Kit Lower Mid Range", "data":{"T1":58,"T2":57,"T3":56,"T4":55,"T5":54,"T6":53,"T7":52,"T8":51,"T9":50,"T10":49,"T11":48,"T12":47,"T13":46,"T14":45,"T15":44,"T16":43, "vol":127}},
        {"preset": "Drum Kit Upper Mid Range", "data":{"T1":74,"T2":73,"T3":72,"T4":71,"T5":70,"T6":69,"T7":68,"T8":67,"T9":66,"T10":65,"T11":64,"T12":63,"T13":62,"T14":61,"T15":60,"T16":59, "vol":127}},
        {"preset": "Drum Kit Upper Range", "data":{"T1":87,"T2":86,"T3":85,"T4":84,"T5":83,"T6":82,"T7":81,"T8":80,"T9":79,"T10":78,"T11":77,"T12":76,"T13":75,"T14":74,"T15":73,"T16":72, "vol":127}},
        
        // cord presets
        
        {"preset": "Cord: C (Major)", "data":{"T1":100,"T2":95,"T3":92,"T4":88,"T5":83,"T6":80,"T7":76,"T8":71,"T9":68,"T10":64,"T11":59,"T12":56,"T13":52,"T14":47,"T15":44,"T16":40, "vol":127}},
        {"preset": "Cord: C (Major 7)", "data":{"T1":87,"T2":83,"T3":80,"T4":76,"T5":75,"T6":71,"T7":68,"T8":64,"T9":63,"T10":59,"T11":56,"T12":52,"T13":51,"T14":47,"T15":44,"T16":40, "vol":127}},
        {"preset": "Cord: C (minor)", "data":{"T1":100,"T2":95,"T3":91,"T4":88,"T5":83,"T6":79,"T7":76,"T8":71,"T9":67,"T10":64,"T11":59,"T12":55,"T13":52,"T14":47,"T15":43,"T16":40, "vol":127}},
        {"preset": "Cord: C (minor 7)", "data":{"T1":86,"T2":83,"T3":79,"T4":76,"T5":74,"T6":71,"T7":67,"T8":64,"T9":62,"T10":59,"T11":55,"T12":52,"T13":50,"T14":47,"T15":43,"T16":40, "vol":127}},
        {"preset": "Cord: C (Suspended 2nd)", "data":{"T1":100,"T2":95,"T3":90,"T4":88,"T5":83,"T6":78,"T7":76,"T8":71,"T9":66,"T10":64,"T11":59,"T12":54,"T13":52,"T14":47,"T15":42,"T16":40, "vol":127}},
        {"preset": "Cord: C (Suspended 4nd)", "data":{"T1":100,"T2":95,"T3":93,"T4":88,"T5":83,"T6":81,"T7":76,"T8":71,"T9":69,"T10":64,"T11":59,"T12":57,"T13":52,"T14":47,"T15":45,"T16":40, "vol":127}},
        
        {"preset": "Cord: C#/Db (Major)", "data":{"T1":101,"T2":96,"T3":93,"T4":89,"T5":84,"T6":81,"T7":77,"T8":72,"T9":69,"T10":65,"T11":60,"T12":57,"T13":53,"T14":48,"T15":45,"T16":41, "vol":127}},
        {"preset": "Cord: C#/Db (Major 7)", "data":{"T1":88,"T2":84,"T3":81,"T4":77,"T5":76,"T6":72,"T7":69,"T8":65,"T9":64,"T10":60,"T11":57,"T12":53,"T13":52,"T14":48,"T15":45,"T16":41, "vol":127}},
        {"preset": "Cord: C#/Db (minor)", "data":{"T1":101,"T2":96,"T3":92,"T4":89,"T5":84,"T6":80,"T7":77,"T8":72,"T9":68,"T10":65,"T11":60,"T12":56,"T13":53,"T14":48,"T15":44,"T16":41, "vol":127}},
        {"preset": "Cord: C#/Db (minor 7)", "data":{"T1":87,"T2":84,"T3":80,"T4":77,"T5":75,"T6":72,"T7":68,"T8":65,"T9":63,"T10":60,"T11":56,"T12":53,"T13":51,"T14":48,"T15":44,"T16":41, "vol":127}},
        {"preset": "Cord: C#/Db (Suspended 2nd)", "data":{"T1":101,"T2":96,"T3":91,"T4":89,"T5":84,"T6":79,"T7":77,"T8":72,"T9":67,"T10":65,"T11":60,"T12":55,"T13":53,"T14":48,"T15":43,"T16":41, "vol":127}},
        {"preset": "Cord: C#/Db (Suspended 4nd)", "data":{"T1":101,"T2":96,"T3":94,"T4":89,"T5":84,"T6":82,"T7":77,"T8":72,"T9":70,"T10":65,"T11":60,"T12":58,"T13":53,"T14":48,"T15":46,"T16":41, "vol":127}},
        
        {"preset": "Cord: D (Major)", "data":{"T1":102,"T2":97,"T3":94,"T4":90,"T5":85,"T6":82,"T7":78,"T8":73,"T9":70,"T10":66,"T11":61,"T12":58,"T13":54,"T14":49,"T15":46,"T16":42, "vol":127}},
        {"preset": "Cord: D (Major 7)", "data":{"T1":89,"T2":85,"T3":82,"T4":78,"T5":77,"T6":73,"T7":70,"T8":66,"T9":65,"T10":61,"T11":58,"T12":54,"T13":53,"T14":49,"T15":46,"T16":42, "vol":127}},
        {"preset": "Cord: D (minor)", "data":{"T1":102,"T2":97,"T3":93,"T4":90,"T5":85,"T6":81,"T7":78,"T8":73,"T9":69,"T10":66,"T11":61,"T12":57,"T13":54,"T14":49,"T15":45,"T16":42, "vol":127}},
        {"preset": "Cord: D (minor 7)", "data":{"T1":88,"T2":85,"T3":81,"T4":78,"T5":76,"T6":73,"T7":69,"T8":66,"T9":64,"T10":61,"T11":57,"T12":54,"T13":52,"T14":49,"T15":45,"T16":42, "vol":127}},
        {"preset": "Cord: D (Suspended 2nd)", "data":{"T1":102,"T2":97,"T3":92,"T4":90,"T5":85,"T6":80,"T7":78,"T8":73,"T9":68,"T10":66,"T11":61,"T12":56,"T13":54,"T14":49,"T15":44,"T16":42, "vol":127}},
        {"preset": "Cord: D (Suspended 4nd)", "data":{"T1":102,"T2":97,"T3":95,"T4":90,"T5":85,"T6":83,"T7":78,"T8":73,"T9":71,"T10":66,"T11":61,"T12":59,"T13":54,"T14":49,"T15":47,"T16":42, "vol":127}},
        
        {"preset": "Cord: D#/Eb (Major)", "data":{"T1":103,"T2":98,"T3":95,"T4":91,"T5":86,"T6":83,"T7":79,"T8":74,"T9":71,"T10":67,"T11":62,"T12":59,"T13":55,"T14":50,"T15":47,"T16":43, "vol":127}},
        {"preset": "Cord: D#/Eb (Major 7)", "data":{"T1":90,"T2":86,"T3":83,"T4":79,"T5":78,"T6":74,"T7":71,"T8":67,"T9":66,"T10":62,"T11":59,"T12":55,"T13":54,"T14":50,"T15":47,"T16":43, "vol":127}},
        {"preset": "Cord: D#/Eb (minor)", "data":{"T1":103,"T2":98,"T3":94,"T4":91,"T5":86,"T6":82,"T7":79,"T8":74,"T9":70,"T10":67,"T11":62,"T12":58,"T13":55,"T14":50,"T15":46,"T16":43, "vol":127}},
        {"preset": "Cord: D#/Eb (minor 7)", "data":{"T1":89,"T2":86,"T3":82,"T4":79,"T5":77,"T6":74,"T7":70,"T8":67,"T9":65,"T10":62,"T11":58,"T12":55,"T13":53,"T14":50,"T15":46,"T16":43, "vol":127}},
        {"preset": "Cord: D#/Eb (Suspended 2nd)", "data":{"T1":103,"T2":98,"T3":93,"T4":91,"T5":86,"T6":81,"T7":79,"T8":74,"T9":69,"T10":67,"T11":62,"T12":57,"T13":55,"T14":50,"T15":45,"T16":43, "vol":127}},
        {"preset": "Cord: D#/Eb (Suspended 4nd)", "data":{"T1":103,"T2":98,"T3":96,"T4":91,"T5":86,"T6":84,"T7":79,"T8":74,"T9":72,"T10":67,"T11":62,"T12":60,"T13":55,"T14":50,"T15":48,"T16":43, "vol":127}},
        
        {"preset": "Cord: E (Major)", "data":{"T1":92,"T2":87,"T3":84,"T4":80,"T5":75,"T6":72,"T7":68,"T8":63,"T9":60,"T10":56,"T11":51,"T12":48,"T13":44,"T14":39,"T15":36,"T16":32, "vol":127}},
        {"preset": "Cord: E (Major 7)", "data":{"T1":79,"T2":75,"T3":72,"T4":68,"T5":67,"T6":63,"T7":60,"T8":56,"T9":55,"T10":51,"T11":48,"T12":44,"T13":43,"T14":39,"T15":36,"T16":32, "vol":127}},
        {"preset": "Cord: E (minor)", "data":{"T1":92,"T2":87,"T3":83,"T4":80,"T5":75,"T6":71,"T7":68,"T8":63,"T9":59,"T10":56,"T11":51,"T12":47,"T13":44,"T14":39,"T15":35,"T16":32, "vol":127}},
        {"preset": "Cord: E (minor 7)", "data":{"T1":78,"T2":75,"T3":71,"T4":68,"T5":66,"T6":63,"T7":59,"T8":56,"T9":54,"T10":51,"T11":47,"T12":44,"T13":42,"T14":39,"T15":35,"T16":32, "vol":127}},
        {"preset": "Cord: E (Suspended 2nd)", "data":{"T1":92,"T2":87,"T3":82,"T4":80,"T5":75,"T6":70,"T7":68,"T8":63,"T9":58,"T10":56,"T11":51,"T12":46,"T13":44,"T14":39,"T15":34,"T16":32, "vol":127}},
        {"preset": "Cord: E (Suspended 4nd)", "data":{"T1":92,"T2":87,"T3":85,"T4":80,"T5":75,"T6":73,"T7":68,"T8":63,"T9":61,"T10":56,"T11":51,"T12":49,"T13":44,"T14":39,"T15":37,"T16":32, "vol":127}},
        
        {"preset": "Cord: F (Major)", "data":{"T1":93,"T2":88,"T3":85,"T4":81,"T5":76,"T6":73,"T7":69,"T8":64,"T9":61,"T10":57,"T11":52,"T12":49,"T13":45,"T14":40,"T15":37,"T16":33, "vol":127}},
        {"preset": "Cord: F (Major 7)", "data":{"T1":80,"T2":76,"T3":73,"T4":69,"T5":68,"T6":64,"T7":61,"T8":57,"T9":56,"T10":52,"T11":49,"T12":45,"T13":44,"T14":40,"T15":37,"T16":33, "vol":127}},
        {"preset": "Cord: F (minor)", "data":{"T1":93,"T2":88,"T3":84,"T4":81,"T5":76,"T6":72,"T7":69,"T8":64,"T9":60,"T10":57,"T11":52,"T12":48,"T13":45,"T14":40,"T15":36,"T16":33, "vol":127}},
        {"preset": "Cord: F (minor 7)", "data":{"T1":79,"T2":76,"T3":72,"T4":69,"T5":67,"T6":64,"T7":60,"T8":57,"T9":55,"T10":52,"T11":48,"T12":45,"T13":43,"T14":40,"T15":36,"T16":33, "vol":127}},
        {"preset": "Cord: F (Suspended 2nd)", "data":{"T1":93,"T2":88,"T3":83,"T4":81,"T5":76,"T6":71,"T7":69,"T8":64,"T9":59,"T10":57,"T11":52,"T12":47,"T13":45,"T14":40,"T15":35,"T16":33, "vol":127}},
        {"preset": "Cord: F (Suspended 4nd)", "data":{"T1":93,"T2":88,"T3":86,"T4":81,"T5":76,"T6":74,"T7":69,"T8":64,"T9":62,"T10":57,"T11":52,"T12":50,"T13":45,"T14":40,"T15":38,"T16":33, "vol":127}},
        
        {"preset": "Cord: F#/Gb (Major)", "data":{"T1":94,"T2":89,"T3":86,"T4":82,"T5":77,"T6":74,"T7":70,"T8":65,"T9":62,"T10":58,"T11":53,"T12":50,"T13":46,"T14":41,"T15":38,"T16":34, "vol":127}},
        {"preset": "Cord: F#/Gb (Major 7)", "data":{"T1":81,"T2":77,"T3":74,"T4":70,"T5":69,"T6":65,"T7":62,"T8":58,"T9":57,"T10":53,"T11":50,"T12":46,"T13":45,"T14":41,"T15":38,"T16":34, "vol":127}},
        {"preset": "Cord: F#/Gb (minor)", "data":{"T1":94,"T2":89,"T3":85,"T4":82,"T5":77,"T6":73,"T7":70,"T8":65,"T9":61,"T10":58,"T11":53,"T12":49,"T13":46,"T14":41,"T15":37,"T16":34, "vol":127}},
        {"preset": "Cord: F#/Gb (minor 7)", "data":{"T1":80,"T2":77,"T3":73,"T4":70,"T5":68,"T6":65,"T7":61,"T8":58,"T9":56,"T10":53,"T11":49,"T12":46,"T13":44,"T14":41,"T15":37,"T16":34, "vol":127}},
        {"preset": "Cord: F#/Gb (Suspended 2nd)", "data":{"T1":94,"T2":89,"T3":84,"T4":82,"T5":77,"T6":72,"T7":70,"T8":65,"T9":60,"T10":58,"T11":53,"T12":48,"T13":46,"T14":41,"T15":36,"T16":34, "vol":127}},
        {"preset": "Cord: F#/Gb (Suspended 4nd)", "data":{"T1":94,"T2":89,"T3":87,"T4":82,"T5":77,"T6":75,"T7":70,"T8":65,"T9":63,"T10":58,"T11":53,"T12":51,"T13":46,"T14":41,"T15":39,"T16":34, "vol":127}},
        
        {"preset": "Cord: G (Major)", "data":{"T1":95,"T2":90,"T3":87,"T4":83,"T5":78,"T6":75,"T7":71,"T8":66,"T9":63,"T10":59,"T11":54,"T12":51,"T13":47,"T14":42,"T15":39,"T16":35, "vol":127}},
        {"preset": "Cord: G (Major 7)", "data":{"T1":82,"T2":78,"T3":75,"T4":71,"T5":70,"T6":66,"T7":63,"T8":59,"T9":58,"T10":54,"T11":51,"T12":47,"T13":46,"T14":42,"T15":39,"T16":35, "vol":127}},
        {"preset": "Cord: G (minor)", "data":{"T1":95,"T2":90,"T3":86,"T4":83,"T5":78,"T6":74,"T7":71,"T8":66,"T9":62,"T10":59,"T11":54,"T12":50,"T13":47,"T14":42,"T15":38,"T16":35, "vol":127}},
        {"preset": "Cord: G (minor 7)", "data":{"T1":81,"T2":78,"T3":74,"T4":71,"T5":69,"T6":66,"T7":62,"T8":59,"T9":57,"T10":54,"T11":50,"T12":47,"T13":45,"T14":42,"T15":38,"T16":35, "vol":127}},
        {"preset": "Cord: G (Suspended 2nd)", "data":{"T1":95,"T2":90,"T3":85,"T4":83,"T5":78,"T6":73,"T7":71,"T8":66,"T9":61,"T10":59,"T11":54,"T12":49,"T13":47,"T14":42,"T15":37,"T16":35, "vol":127}},
        {"preset": "Cord: G (Suspended 4nd)", "data":{"T1":95,"T2":90,"T3":88,"T4":83,"T5":78,"T6":76,"T7":71,"T8":66,"T9":64,"T10":59,"T11":54,"T12":52,"T13":47,"T14":42,"T15":40,"T16":35, "vol":127}},
        
        {"preset": "Cord: G#/Ab (Major)", "data":{"T1":96,"T2":91,"T3":88,"T4":84,"T5":79,"T6":76,"T7":72,"T8":67,"T9":64,"T10":60,"T11":55,"T12":52,"T13":48,"T14":43,"T15":40,"T16":36, "vol":127}},
        {"preset": "Cord: G#/Ab (Major 7)", "data":{"T1":83,"T2":79,"T3":76,"T4":72,"T5":71,"T6":67,"T7":64,"T8":60,"T9":59,"T10":55,"T11":52,"T12":48,"T13":47,"T14":43,"T15":40,"T16":36, "vol":127}},
        {"preset": "Cord: G#/Ab (minor)", "data":{"T1":96,"T2":91,"T3":87,"T4":84,"T5":79,"T6":75,"T7":72,"T8":67,"T9":63,"T10":60,"T11":55,"T12":51,"T13":48,"T14":43,"T15":39,"T16":36, "vol":127}},
        {"preset": "Cord: G#/Ab (minor 7)", "data":{"T1":82,"T2":79,"T3":75,"T4":72,"T5":70,"T6":67,"T7":63,"T8":60,"T9":58,"T10":55,"T11":51,"T12":48,"T13":46,"T14":43,"T15":39,"T16":36, "vol":127}},
        {"preset": "Cord: G#/Ab (Suspended 2nd)", "data":{"T1":96,"T2":91,"T3":86,"T4":84,"T5":79,"T6":74,"T7":72,"T8":67,"T9":62,"T10":60,"T11":55,"T12":50,"T13":48,"T14":43,"T15":38,"T16":36, "vol":127}},
        {"preset": "Cord: G#/Ab (Suspended 4nd)", "data":{"T1":96,"T2":91,"T3":89,"T4":84,"T5":79,"T6":77,"T7":72,"T8":67,"T9":65,"T10":60,"T11":55,"T12":53,"T13":48,"T14":43,"T15":41,"T16":36, "vol":127}},
        
        {"preset": "Cord: A (Major)", "data":{"T1":97,"T2":92,"T3":89,"T4":85,"T5":80,"T6":77,"T7":73,"T8":68,"T9":65,"T10":61,"T11":56,"T12":53,"T13":49,"T14":44,"T15":41,"T16":37, "vol":127}},
        {"preset": "Cord: A (Major 7)", "data":{"T1":84,"T2":80,"T3":77,"T4":73,"T5":72,"T6":68,"T7":65,"T8":61,"T9":60,"T10":56,"T11":53,"T12":49,"T13":48,"T14":44,"T15":41,"T16":37, "vol":127}},
        {"preset": "Cord: A (minor)", "data":{"T1":97,"T2":92,"T3":88,"T4":85,"T5":80,"T6":76,"T7":73,"T8":68,"T9":64,"T10":61,"T11":56,"T12":52,"T13":49,"T14":44,"T15":40,"T16":37, "vol":127}},
        {"preset": "Cord: A (minor 7)", "data":{"T1":83,"T2":80,"T3":76,"T4":73,"T5":71,"T6":68,"T7":64,"T8":61,"T9":59,"T10":56,"T11":52,"T12":49,"T13":47,"T14":44,"T15":40,"T16":37, "vol":127}},
        {"preset": "Cord: A (Suspended 2nd)", "data":{"T1":97,"T2":92,"T3":87,"T4":85,"T5":80,"T6":75,"T7":73,"T8":68,"T9":63,"T10":61,"T11":56,"T12":51,"T13":49,"T14":44,"T15":39,"T16":37, "vol":127}},
        {"preset": "Cord: A (Suspended 4nd)", "data":{"T1":97,"T2":92,"T3":90,"T4":85,"T5":80,"T6":78,"T7":73,"T8":68,"T9":66,"T10":61,"T11":56,"T12":54,"T13":49,"T14":44,"T15":42,"T16":37, "vol":127}},
        
        {"preset": "Cord: A#/Bb (Major)", "data":{"T1":98,"T2":93,"T3":90,"T4":86,"T5":81,"T6":78,"T7":74,"T8":69,"T9":66,"T10":62,"T11":57,"T12":54,"T13":50,"T14":45,"T15":42,"T16":38, "vol":127}},
        {"preset": "Cord: A#/Bb (Major 7)", "data":{"T1":85,"T2":81,"T3":78,"T4":74,"T5":73,"T6":69,"T7":66,"T8":62,"T9":61,"T10":57,"T11":54,"T12":50,"T13":49,"T14":45,"T15":42,"T16":38, "vol":127}},
        {"preset": "Cord: A#/Bb (minor)", "data":{"T1":98,"T2":93,"T3":89,"T4":86,"T5":81,"T6":77,"T7":74,"T8":69,"T9":65,"T10":62,"T11":57,"T12":53,"T13":50,"T14":45,"T15":41,"T16":38, "vol":127}},
        {"preset": "Cord: A#/Bb (minor 7)", "data":{"T1":84,"T2":81,"T3":77,"T4":74,"T5":72,"T6":69,"T7":65,"T8":62,"T9":60,"T10":57,"T11":53,"T12":50,"T13":48,"T14":45,"T15":41,"T16":38, "vol":127}},
        {"preset": "Cord: A#/Bb (Suspended 2nd)", "data":{"T1":98,"T2":93,"T3":88,"T4":86,"T5":81,"T6":76,"T7":74,"T8":69,"T9":64,"T10":62,"T11":57,"T12":52,"T13":50,"T14":45,"T15":40,"T16":38, "vol":127}},
        {"preset": "Cord: A#/Bb (Suspended 4nd)", "data":{"T1":98,"T2":93,"T3":91,"T4":86,"T5":81,"T6":79,"T7":74,"T8":69,"T9":67,"T10":62,"T11":57,"T12":55,"T13":50,"T14":45,"T15":43,"T16":38, "vol":127}},
        
        {"preset": "Cord: B (Major)", "data":{"T1":99,"T2":94,"T3":91,"T4":87,"T5":82,"T6":79,"T7":75,"T8":70,"T9":67,"T10":63,"T11":58,"T12":55,"T13":51,"T14":46,"T15":43,"T16":39, "vol":127}},
        {"preset": "Cord: B (Major 7)", "data":{"T1":86,"T2":82,"T3":79,"T4":75,"T5":74,"T6":70,"T7":67,"T8":63,"T9":62,"T10":58,"T11":55,"T12":51,"T13":50,"T14":46,"T15":43,"T16":39, "vol":127}},
        {"preset": "Cord: B (minor)", "data":{"T1":99,"T2":94,"T3":90,"T4":87,"T5":82,"T6":78,"T7":75,"T8":70,"T9":66,"T10":63,"T11":58,"T12":54,"T13":51,"T14":46,"T15":42,"T16":39, "vol":127}},
        {"preset": "Cord: B (minor 7)", "data":{"T1":85,"T2":82,"T3":78,"T4":75,"T5":73,"T6":70,"T7":66,"T8":63,"T9":61,"T10":58,"T11":54,"T12":51,"T13":49,"T14":46,"T15":42,"T16":39, "vol":127}},
        {"preset": "Cord: B (Suspended 2nd)", "data":{"T1":99,"T2":94,"T3":89,"T4":87,"T5":82,"T6":77,"T7":75,"T8":70,"T9":65,"T10":63,"T11":58,"T12":53,"T13":51,"T14":46,"T15":41,"T16":39, "vol":127}},
        {"preset": "Cord: B (Suspended 4nd)", "data":{"T1":99,"T2":94,"T3":92,"T4":87,"T5":82,"T6":80,"T7":75,"T8":70,"T9":68,"T10":63,"T11":58,"T12":56,"T13":51,"T14":46,"T15":44,"T16":39, "vol":127}},
        
        //{"preset": "Music Matrix Cm", "data":{"T1":76,"T2":72,"T3":71,"T4":69,"T5":66,"T6":64,"T7":60,"T8":59,"T9":57,"T10":54,"T11":52,"T12":48,"T13":47,"T14":45,"T15":42,"T16":40}},
        
        // major/minor presets
        
        {"preset": "C3 Major", "data":{"T1":54,"T2":52,"T3":51,"T4":49,"T5":47,"T6":45,"T7":44,"T8":42,"T9":40,"T10":39,"T11":37,"T12":35,"T13":33,"T14":32,"T15":30,"T16":28, "vol":127}},
        {"preset": "C5 Major", "data":{"T1":78,"T2":76,"T3":75,"T4":73,"T5":71,"T6":69,"T7":68,"T8":66,"T9":64,"T10":63,"T11":61,"T12":59,"T13":57,"T14":56,"T15":54,"T16":52, "vol":127}},
        {"preset": "C7 Major", "data":{"T1":102,"T2":100,"T3":99,"T4":97,"T5":95,"T6":93,"T7":92,"T8":90,"T9":88,"T10":87,"T11":85,"T12":83,"T13":81,"T14":80,"T15":78,"T16":76, "vol":127}},
        
        {"preset": "G2 Major", "data":{"T1":49,"T2":47,"T3":46,"T4":44,"T5":42,"T6":40,"T7":39,"T8":37,"T9":35,"T10":34,"T11":32,"T12":30,"T13":28,"T14":27,"T15":25,"T16":23, "vol":127}},
        {"preset": "G4 Major", "data":{"T1":73,"T2":71,"T3":70,"T4":68,"T5":66,"T6":64,"T7":63,"T8":61,"T9":59,"T10":58,"T11":56,"T12":54,"T13":52,"T14":51,"T15":49,"T16":47, "vol":127}},
        {"preset": "G6 Major", "data":{"T1":97,"T2":95,"T3":94,"T4":92,"T5":90,"T6":88,"T7":87,"T8":85,"T9":83,"T10":82,"T11":80,"T12":78,"T13":76,"T14":75,"T15":73,"T16":71, "vol":127}},
        
        {"preset": "D3 Major", "data":{"T1":56,"T2":54,"T3":53,"T4":51,"T5":49,"T6":47,"T7":46,"T8":44,"T9":42,"T10":41,"T11":39,"T12":37,"T13":35,"T14":34,"T15":32,"T16":30, "vol":127}},
        {"preset": "D5 Major", "data":{"T1":80,"T2":78,"T3":77,"T4":75,"T5":73,"T6":71,"T7":70,"T8":68,"T9":66,"T10":65,"T11":63,"T12":61,"T13":59,"T14":58,"T15":56,"T16":54, "vol":127}},
        {"preset": "D7 Major", "data":{"T1":104,"T2":102,"T3":101,"T4":99,"T5":97,"T6":95,"T7":94,"T8":92,"T9":90,"T10":89,"T11":87,"T12":85,"T13":83,"T14":82,"T15":80,"T16":78, "vol":127}},
        
        {"preset": "A2 Major", "data":{"T1":51,"T2":49,"T3":48,"T4":46,"T5":44,"T6":42,"T7":41,"T8":39,"T9":37,"T10":36,"T11":34,"T12":32,"T13":30,"T14":29,"T15":27,"T16":25, "vol":127}},
        {"preset": "A4 Major", "data":{"T1":75,"T2":73,"T3":72,"T4":70,"T5":68,"T6":66,"T7":65,"T8":63,"T9":61,"T10":60,"T11":58,"T12":56,"T13":54,"T14":53,"T15":51,"T16":49, "vol":127}},
        {"preset": "A6 Major", "data":{"T1":99,"T2":97,"T3":96,"T4":94,"T5":92,"T6":90,"T7":89,"T8":87,"T9":85,"T10":84,"T11":82,"T12":80,"T13":78,"T14":77,"T15":75,"T16":73, "vol":127}},
        
        {"preset": "E3 Major", "data":{"T1":58,"T2":56,"T3":55,"T4":53,"T5":51,"T6":49,"T7":48,"T8":46,"T9":44,"T10":43,"T11":41,"T12":39,"T13":37,"T14":36,"T15":34,"T16":32, "vol":127}},
        {"preset": "E5 Major", "data":{"T1":82,"T2":80,"T3":79,"T4":77,"T5":75,"T6":73,"T7":72,"T8":70,"T9":68,"T10":67,"T11":65,"T12":63,"T13":61,"T14":60,"T15":58,"T16":56, "vol":127}},
        {"preset": "E7 Major", "data":{"T1":106,"T2":104,"T3":103,"T4":101,"T5":99,"T6":97,"T7":96,"T8":94,"T9":92,"T10":91,"T11":89,"T12":87,"T13":85,"T14":84,"T15":82,"T16":80, "vol":127}},
        
        {"preset": "B2 Major", "data":{"T1":53,"T2":51,"T3":50,"T4":48,"T5":46,"T6":44,"T7":43,"T8":41,"T9":39,"T10":38,"T11":36,"T12":34,"T13":32,"T14":31,"T15":29,"T16":27, "vol":127}},
        {"preset": "B4 Major", "data":{"T1":77,"T2":75,"T3":74,"T4":72,"T5":70,"T6":68,"T7":67,"T8":65,"T9":63,"T10":62,"T11":60,"T12":58,"T13":56,"T14":55,"T15":53,"T16":51, "vol":127}},
        {"preset": "B6 Major", "data":{"T1":101,"T2":99,"T3":98,"T4":96,"T5":94,"T6":92,"T7":91,"T8":89,"T9":87,"T10":86,"T11":84,"T12":82,"T13":80,"T14":79,"T15":77,"T16":75, "vol":127}},
        
        {"preset": "F#2/Gb2 Major", "data":{"T1":48,"T2":46,"T3":45,"T4":43,"T5":41,"T6":39,"T7":38,"T8":36,"T9":34,"T10":33,"T11":31,"T12":29,"T13":27,"T14":26,"T15":24,"T16":22, "vol":127}},
        {"preset": "F#4/Gb4 Major", "data":{"T1":72,"T2":70,"T3":69,"T4":67,"T5":65,"T6":63,"T7":62,"T8":60,"T9":58,"T10":57,"T11":55,"T12":53,"T13":51,"T14":50,"T15":48,"T16":46, "vol":127}},
        {"preset": "F#6/Gb6 Major", "data":{"T1":96,"T2":94,"T3":93,"T4":91,"T5":89,"T6":87,"T7":86,"T8":84,"T9":82,"T10":81,"T11":79,"T12":77,"T13":75,"T14":74,"T15":72,"T16":70, "vol":127}},
        
        {"preset": "F2 Major", "data":{"T1":47,"T2":45,"T3":44,"T4":42,"T5":40,"T6":38,"T7":37,"T8":35,"T9":33,"T10":32,"T11":30,"T12":28,"T13":26,"T14":25,"T15":23,"T16":21, "vol":127}},
        {"preset": "F4 Major", "data":{"T1":71,"T2":69,"T3":68,"T4":66,"T5":64,"T6":62,"T7":61,"T8":59,"T9":57,"T10":56,"T11":54,"T12":52,"T13":50,"T14":49,"T15":47,"T16":45, "vol":127}},
        {"preset": "F6 Major", "data":{"T1":95,"T2":93,"T3":92,"T4":90,"T5":88,"T6":86,"T7":85,"T8":83,"T9":81,"T10":80,"T11":78,"T12":76,"T13":74,"T14":73,"T15":71,"T16":69, "vol":127}},
        
        {"preset": "A#2/Bb2 Major", "data":{"T1":52,"T2":50,"T3":49,"T4":47,"T5":45,"T6":43,"T7":42,"T8":40,"T9":38,"T10":37,"T11":35,"T12":33,"T13":31,"T14":30,"T15":28,"T16":26, "vol":127}},
        {"preset": "A#4/Bb4 Major", "data":{"T1":76,"T2":74,"T3":73,"T4":71,"T5":69,"T6":67,"T7":66,"T8":64,"T9":62,"T10":61,"T11":59,"T12":57,"T13":55,"T14":54,"T15":52,"T16":50, "vol":127}},
        {"preset": "A#6/Bb6 Major", "data":{"T1":100,"T2":98,"T3":97,"T4":95,"T5":93,"T6":91,"T7":90,"T8":88,"T9":86,"T10":85,"T11":83,"T12":81,"T13":79,"T14":78,"T15":76,"T16":74, "vol":127}},
        
        {"preset": "D#3/Eb3 Major", "data":{"T1":57,"T2":55,"T3":54,"T4":52,"T5":50,"T6":48,"T7":47,"T8":45,"T9":43,"T10":42,"T11":40,"T12":38,"T13":36,"T14":35,"T15":33,"T16":31, "vol":127}},
        {"preset": "D#5/Eb5 Major", "data":{"T1":81,"T2":79,"T3":78,"T4":76,"T5":74,"T6":72,"T7":71,"T8":69,"T9":67,"T10":66,"T11":64,"T12":62,"T13":60,"T14":59,"T15":57,"T16":55, "vol":127}},
        {"preset": "D#7/Eb7 Major", "data":{"T1":105,"T2":103,"T3":102,"T4":100,"T5":98,"T6":96,"T7":95,"T8":93,"T9":91,"T10":90,"T11":88,"T12":86,"T13":84,"T14":83,"T15":81,"T16":79, "vol":127}},
        
        {"preset": "G#2/Ab2 Major", "data":{"T1":50,"T2":48,"T3":47,"T4":45,"T5":43,"T6":41,"T7":40,"T8":38,"T9":36,"T10":35,"T11":33,"T12":31,"T13":29,"T14":28,"T15":26,"T16":24, "vol":127}},
        {"preset": "G#4/Ab4 Major", "data":{"T1":74,"T2":72,"T3":71,"T4":69,"T5":67,"T6":65,"T7":64,"T8":62,"T9":60,"T10":59,"T11":57,"T12":55,"T13":53,"T14":52,"T15":50,"T16":48, "vol":127}},
        {"preset": "G#6/Ab6 Major", "data":{"T1":98,"T2":96,"T3":95,"T4":93,"T5":91,"T6":89,"T7":88,"T8":86,"T9":84,"T10":83,"T11":81,"T12":79,"T13":77,"T14":76,"T15":74,"T16":72, "vol":127}},
        
        {"preset": "C#5/Db5 Major", "data":{"T1":55,"T2":53,"T3":52,"T4":50,"T5":48,"T6":46,"T7":45,"T8":43,"T9":41,"T10":40,"T11":38,"T12":36,"T13":34,"T14":33,"T15":31,"T16":29, "vol":127}},
        {"preset": "C#5/Db5 Major", "data":{"T1":79,"T2":77,"T3":76,"T4":74,"T5":72,"T6":70,"T7":69,"T8":67,"T9":65,"T10":64,"T11":62,"T12":60,"T13":58,"T14":57,"T15":55,"T16":53, "vol":127}},
        {"preset": "C#7/Db7 Major", "data":{"T1":103,"T2":101,"T3":100,"T4":98,"T5":96,"T6":94,"T7":93,"T8":91,"T9":89,"T10":88,"T11":86,"T12":84,"T13":82,"T14":81,"T15":79,"T16":77, "vol":127}},
        
        {"preset": "C3 minor", "data":{"T1":54,"T2":52,"T3":50,"T4":48,"T5":47,"T6":45,"T7":43,"T8":42,"T9":40,"T10":38,"T11":36,"T12":35,"T13":33,"T14":31,"T15":30,"T16":28, "vol":127}},
        {"preset": "C5 minor", "data":{"T1":78,"T2":76,"T3":74,"T4":72,"T5":71,"T6":69,"T7":67,"T8":66,"T9":64,"T10":62,"T11":60,"T12":59,"T13":57,"T14":55,"T15":54,"T16":52, "vol":127}},
        {"preset": "C7 minor", "data":{"T1":102,"T2":100,"T3":98,"T4":96,"T5":95,"T6":93,"T7":91,"T8":90,"T9":88,"T10":86,"T11":84,"T12":83,"T13":81,"T14":79,"T15":78,"T16":76, "vol":127}},
        
        {"preset": "G2 minor", "data":{"T1":49,"T2":47,"T3":45,"T4":43,"T5":42,"T6":40,"T7":38,"T8":37,"T9":35,"T10":33,"T11":31,"T12":30,"T13":28,"T14":26,"T15":25,"T16":23, "vol":127}},
        {"preset": "G4 minor", "data":{"T1":73,"T2":71,"T3":69,"T4":67,"T5":66,"T6":64,"T7":62,"T8":61,"T9":59,"T10":57,"T11":55,"T12":54,"T13":52,"T14":50,"T15":49,"T16":47, "vol":127}},
        {"preset": "G6 minor", "data":{"T1":97,"T2":95,"T3":93,"T4":91,"T5":90,"T6":88,"T7":86,"T8":85,"T9":83,"T10":81,"T11":79,"T12":78,"T13":76,"T14":74,"T15":73,"T16":71, "vol":127}},
        
        {"preset": "D3 minor", "data":{"T1":56,"T2":54,"T3":52,"T4":50,"T5":49,"T6":47,"T7":45,"T8":44,"T9":42,"T10":40,"T11":38,"T12":37,"T13":35,"T14":33,"T15":32,"T16":30, "vol":127}},
        {"preset": "D5 minor", "data":{"T1":80,"T2":78,"T3":76,"T4":74,"T5":73,"T6":71,"T7":69,"T8":68,"T9":66,"T10":64,"T11":62,"T12":61,"T13":59,"T14":57,"T15":56,"T16":54, "vol":127}},
        {"preset": "D7 minor", "data":{"T1":104,"T2":102,"T3":100,"T4":98,"T5":97,"T6":95,"T7":93,"T8":92,"T9":90,"T10":88,"T11":86,"T12":85,"T13":83,"T14":81,"T15":80,"T16":78, "vol":127}},
        
        {"preset": "A2 minor", "data":{"T1":51,"T2":49,"T3":47,"T4":45,"T5":44,"T6":42,"T7":40,"T8":39,"T9":37,"T10":35,"T11":33,"T12":32,"T13":30,"T14":28,"T15":27,"T16":25, "vol":127}},
        {"preset": "A4 minor", "data":{"T1":75,"T2":73,"T3":71,"T4":69,"T5":68,"T6":66,"T7":64,"T8":63,"T9":61,"T10":59,"T11":57,"T12":56,"T13":54,"T14":52,"T15":51,"T16":49, "vol":127}},
        {"preset": "A6 minor", "data":{"T1":99,"T2":97,"T3":95,"T4":93,"T5":92,"T6":90,"T7":88,"T8":87,"T9":85,"T10":83,"T11":81,"T12":80,"T13":78,"T14":76,"T15":75,"T16":73, "vol":127}},
        
        {"preset": "E3 minor", "data":{"T1":58,"T2":56,"T3":54,"T4":52,"T5":51,"T6":49,"T7":47,"T8":46,"T9":44,"T10":42,"T11":40,"T12":39,"T13":37,"T14":35,"T15":34,"T16":32, "vol":127}},
        {"preset": "E5 minor", "data":{"T1":82,"T2":80,"T3":78,"T4":76,"T5":75,"T6":73,"T7":71,"T8":70,"T9":68,"T10":66,"T11":64,"T12":63,"T13":61,"T14":59,"T15":58,"T16":56, "vol":127}},
        {"preset": "E7 minor", "data":{"T1":106,"T2":104,"T3":102,"T4":100,"T5":99,"T6":97,"T7":95,"T8":94,"T9":92,"T10":90,"T11":88,"T12":87,"T13":85,"T14":83,"T15":82,"T16":80, "vol":127}},
        
        {"preset": "B2 minor", "data":{"T1":53,"T2":51,"T3":49,"T4":47,"T5":46,"T6":44,"T7":42,"T8":41,"T9":39,"T10":37,"T11":35,"T12":34,"T13":32,"T14":30,"T15":29,"T16":27, "vol":127}},
        {"preset": "B4 minor", "data":{"T1":77,"T2":75,"T3":73,"T4":71,"T5":70,"T6":68,"T7":66,"T8":65,"T9":63,"T10":61,"T11":59,"T12":58,"T13":56,"T14":54,"T15":53,"T16":51, "vol":127}},
        {"preset": "B6 minor", "data":{"T1":101,"T2":99,"T3":97,"T4":95,"T5":94,"T6":92,"T7":90,"T8":89,"T9":87,"T10":85,"T11":83,"T12":82,"T13":80,"T14":78,"T15":77,"T16":75, "vol":127}},
        
        {"preset": "A#2/Bb2 minor", "data":{"T1":52,"T2":50,"T3":48,"T4":46,"T5":45,"T6":43,"T7":41,"T8":40,"T9":38,"T10":36,"T11":34,"T12":33,"T13":31,"T14":29,"T15":28,"T16":26, "vol":127}},
        {"preset": "A#4/Bb4 minor", "data":{"T1":76,"T2":74,"T3":72,"T4":70,"T5":69,"T6":67,"T7":65,"T8":64,"T9":62,"T10":60,"T11":58,"T12":57,"T13":55,"T14":53,"T15":52,"T16":50, "vol":127}},
        {"preset": "A#6/Bb6 minor", "data":{"T1":100,"T2":98,"T3":96,"T4":94,"T5":93,"T6":91,"T7":89,"T8":88,"T9":86,"T10":84,"T11":82,"T12":81,"T13":79,"T14":77,"T15":76,"T16":74, "vol":127}},
        
        {"preset": "F2 minor", "data":{"T1":47,"T2":45,"T3":43,"T4":41,"T5":40,"T6":38,"T7":36,"T8":35,"T9":33,"T10":31,"T11":29,"T12":28,"T13":26,"T14":24,"T15":23,"T16":21, "vol":127}},
        {"preset": "F4 minor", "data":{"T1":71,"T2":69,"T3":67,"T4":65,"T5":64,"T6":62,"T7":60,"T8":59,"T9":57,"T10":55,"T11":53,"T12":52,"T13":50,"T14":48,"T15":47,"T16":45, "vol":127}},
        {"preset": "F6 minor", "data":{"T1":95,"T2":93,"T3":91,"T4":89,"T5":88,"T6":86,"T7":84,"T8":83,"T9":81,"T10":79,"T11":77,"T12":76,"T13":74,"T14":72,"T15":71,"T16":69, "vol":127}},
        
        {"preset": "F#2/Gb2 minor", "data":{"T1":48,"T2":46,"T3":44,"T4":42,"T5":41,"T6":39,"T7":37,"T8":36,"T9":34,"T10":32,"T11":30,"T12":29,"T13":27,"T14":25,"T15":24,"T16":22, "vol":127}},
        {"preset": "F#4/Gb4 minor", "data":{"T1":72,"T2":70,"T3":68,"T4":66,"T5":65,"T6":63,"T7":61,"T8":60,"T9":58,"T10":56,"T11":54,"T12":53,"T13":51,"T14":49,"T15":48,"T16":46, "vol":127}},
        {"preset": "F#6/Gb6 minor", "data":{"T1":96,"T2":94,"T3":92,"T4":90,"T5":89,"T6":87,"T7":85,"T8":84,"T9":82,"T10":80,"T11":78,"T12":77,"T13":75,"T14":73,"T15":72,"T16":70, "vol":127}},
        
        {"preset": "C#3/Db3 minor", "data":{"T1":55,"T2":53,"T3":51,"T4":49,"T5":48,"T6":46,"T7":44,"T8":43,"T9":41,"T10":39,"T11":37,"T12":36,"T13":34,"T14":32,"T15":31,"T16":29, "vol":127}},
        {"preset": "C#5/Db5 minor", "data":{"T1":79,"T2":77,"T3":75,"T4":73,"T5":72,"T6":70,"T7":68,"T8":67,"T9":65,"T10":63,"T11":61,"T12":60,"T13":58,"T14":56,"T15":55,"T16":53, "vol":127}},
        {"preset": "C#7/Db7 minor", "data":{"T1":103,"T2":101,"T3":99,"T4":97,"T5":96,"T6":94,"T7":92,"T8":91,"T9":89,"T10":87,"T11":85,"T12":84,"T13":82,"T14":80,"T15":79,"T16":77, "vol":127}},
        
        {"preset": "G#2/Ab2 minor", "data":{"T1":50,"T2":48,"T3":46,"T4":44,"T5":43,"T6":41,"T7":39,"T8":38,"T9":36,"T10":34,"T11":32,"T12":31,"T13":29,"T14":27,"T15":26,"T16":24, "vol":127}},
        {"preset": "G#4/Ab4 minor", "data":{"T1":74,"T2":72,"T3":70,"T4":68,"T5":67,"T6":65,"T7":63,"T8":62,"T9":60,"T10":58,"T11":56,"T12":55,"T13":53,"T14":51,"T15":50,"T16":48, "vol":127}},
        {"preset": "G#6/Ab6 minor", "data":{"T1":98,"T2":96,"T3":94,"T4":92,"T5":91,"T6":89,"T7":87,"T8":86,"T9":84,"T10":82,"T11":80,"T12":79,"T13":77,"T14":75,"T15":74,"T16":72, "vol":127}},
        
        {"preset": "D#3/Eb3 minor", "data":{"T1":57,"T2":55,"T3":53,"T4":51,"T5":50,"T6":48,"T7":46,"T8":45,"T9":43,"T10":41,"T11":39,"T12":38,"T13":36,"T14":34,"T15":33,"T16":31, "vol":127}},
        {"preset": "D#5/Eb5 minor", "data":{"T1":81,"T2":79,"T3":77,"T4":75,"T5":74,"T6":72,"T7":70,"T8":69,"T9":67,"T10":65,"T11":63,"T12":62,"T13":60,"T14":58,"T15":57,"T16":55, "vol":127}},
        {"preset": "D#7/Eb7 minor", "data":{"T1":105,"T2":103,"T3":101,"T4":99,"T5":98,"T6":96,"T7":94,"T8":93,"T9":91,"T10":89,"T11":87,"T12":86,"T13":84,"T14":82,"T15":81,"T16":79, "vol":127}}
    ];

/* // making hte keys
//var keyBase = ["F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E"];
var keyBase = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
var keyAll = [];

function octiveMake( octive, keys){
    var currentOctive = [];
    for (var i = 0; i< keys.length; i++){
        currentOctive.push(keys[i]+octive);
    }
    return currentOctive;
}

for (var i = 1; i <=9; i++){
    keyAll.push.apply(keyAll, octiveMake(i, keyBase));
}


// generated from the above function;
var keyAll = [];

var noteToKey = {};
var keyToNote = {};

//generates keyToNote
for (var i = 0; i < keyAll.length; i++){
keyToNote[keyAll[i]] = (i+4).toString();
}

//generates noteToKey
for (var i = 0; i < keyAll.length; i++){
noteToKey[(i+4).toString()] = keyAll[i];
}
*/

var publicRecentSongs = {};
function getPublicSongs(){
    $.get("services/getPublicSongs.php", function(data){
        publicRecentSongs = JSON.parse(data);
        showPublicSongs();
    });
}

function showPublicSongs(){
    var counter = 0;
    $("#newsFeed")[0].innerHTML = "";
    while (publicRecentSongs["song"+counter] != undefined){
        var newsItemBox = document.createElement("div");
        newsItemBox.className="newsFeedItem";
        $("#newsFeed").append(newsItemBox);
        
        var newsItemBoxHeadding = document.createElement("h3");
        newsItemBox.appendChild(newsItemBoxHeadding);
        newsItemBoxHeadding.innerHTML = publicRecentSongs["song"+counter].songName/* + " by: " + publicRecentSongs["song"+counter].creator*/;
        
        var newsItemBoxSubHeadding = document.createElement("p");
        newsItemBox.appendChild(newsItemBoxSubHeadding);
        newsItemBoxSubHeadding.innerHTML = "by: " + publicRecentSongs["song"+counter].creator;
		
		var breakLine1 = document.createElement("br");
		newsItemBox.appendChild(breakLine1);
		
		var editBtn = document.createElement("img");
        newsItemBox.appendChild(editBtn);
		editBtn.src = "img/icons/edit.png";
		editBtn.title = editBtn.alt = "Edit this song";
        editBtn.width = 32;
        editBtn.height = 32;
		editBtn.setAttribute( "onclick", "loadPublicSong('song" + counter + "')");
		
		var shareBtn = document.createElement("img");
        newsItemBox.appendChild(shareBtn);
		shareBtn.src = "img/icons/link.png";
		shareBtn.title = shareBtn.alt = "Share this song";
        shareBtn.width = 32;
        shareBtn.height = 32;
		shareBtn.setAttribute( "onclick", "publicLink('song" + counter + "')");
		
		/*
		var loadBtn = document.createElement("img");
        newsItemBox.appendChild(loadBtn);
        loadBtn.src = "img/icons/loadData.png";
        loadBtn.title = loadBtn.alt = "Fetch data for web player";
        loadBtn.width = 32;
        loadBtn.height = 32;
        loadBtn.setAttribute( "onclick", "getData(" + publicRecentSongs["song"+counter].songID + ")");
        
        var playBtn = document.createElement("img");
        newsItemBox.appendChild(playBtn);
        playBtn.src = "img/icons/Play.png";
        playBtn.title = playBtn.alt = "Webplayer Preview";
        playBtn.width = 32;
        playBtn.height = 32;
        playBtn.setAttribute( "onclick", "playSample(" + publicRecentSongs["song"+counter].songID + ")");
        */
        counter ++;
    }
    PHPcalls();
}
/*
var songDataBuffer = {};
function getData(songID){
	messageOn("Please wait while song data is being loaded", "messageOff()", false, "ok" );
	var dataFlag = 2;
    songDataBuffer["tempBuffer"] = {};
	
	$.post("services/songTracks.php", {songID: songID}, function(data){
		songDataBuffer["tempBuffer"]["trackData"] = JSON.parse(data);
		dataFlag--;
		dataFlagCheck();
	});
	
	$.post("services/getPublicSongData.php", {songID: songID}, function(data){
		songDataBuffer["tempBuffer"]["b64Data"] = data;
		dataFlag--;
		dataFlagCheck();
	});
	
	var counter = 0;
	function dataFlagCheck(){
		if (dataFlag === 0){
			//alert (counter);
			counter = 0;
			while (songDataBuffer["tempBuffer"].trackData["track"+counter] != undefined){
				counter++;
			}
			for (var i = counter-1; i > -1; i--){
				//counter--;
				if (MIDI.Soundfont[songDataBuffer["tempBuffer"].trackData["track"+(i)].instrument] == undefined){
					loadInstrument(songDataBuffer["tempBuffer"].trackData["track"+(i)].instrument, obtainedMidiData());
				}
				else{
					obtainedMidiData();
				}
			}
		}
	}
	
	function obtainedMidiData(){
		counter--;
		
		messageOn("getting instruments... <br>" + (counter+1) + " remaining", "messageOff()", false, "ok" );
		//alert (counter + ", counter=0: " + (counter == 0));
		if (counter == 0){
			afterLoadSync();
		}
	}
	 
	function afterLoadSync(){
		songDataBuffer["songID-"+songID] = $.extend(true, {}, songDataBuffer["tempBuffer"]);
		//songDataBuffer["tempBuffer"] = {};
		
		//alert ("magic1");
		messageOff();
		//alert ("magic2");
	}
}

function playSample(songID, repeat){
	if (repeat == undefined){
		repeat = true;
	}
	if (songDataBuffer["songID-"+songID] != undefined){
		var counter = 0;
		while (songDataBuffer["songID-"+songID].trackData["track"+counter] != undefined){
			MIDI.programChange(counter, instruments.indexOf(songDataBuffer["songID-"+songID].trackData["track"+counter].instrument));
			counter++;
		}
		
		MIDI.Player.currentData = window.atob(songDataBuffer["songID-"+songID].b64Data);
		MIDI.Player.loadMidiFile();
		MIDI.Player.start();
		
		if (repeat){
			playSample(songID, false);
			
			playSample(songID, false);
			
			playSample(songID, false);
			
			playSample(songID, false);
		}
	}
	else{
		messageOn( "There is no data for this track yet. Please load the data for this track before attempting to play this song by clicking the <img src=\"img/icons/loadData.png\" alt=\"Fetch data for web player\" title=\"Fetch data for web player\" width=\"32\" height=\"32\" onclick=\"getData(" + songID + ")\"> button to the left of the play button.");
	}
}
*/

// the notes only goes up to 108 but it's never a bad thing to have more than needed
var noteToKey = {"4":"C1","5":"Db1","6":"D1","7":"Eb1","8":"E1","9":"F1","10":"Gb1","11":"G1","12":"Ab1","13":"A1","14":"Bb1","15":"B1","16":"C2","17":"Db2","18":"D2","19":"Eb2","20":"E2","21":"F2","22":"Gb2","23":"G2","24":"Ab2","25":"A2","26":"Bb2","27":"B2","28":"C3","29":"Db3","30":"D3","31":"Eb3","32":"E3","33":"F3","34":"Gb3","35":"G3","36":"Ab3","37":"A3","38":"Bb3","39":"B3","40":"C4","41":"Db4","42":"D4","43":"Eb4","44":"E4","45":"F4","46":"Gb4","47":"G4","48":"Ab4","49":"A4","50":"Bb4","51":"B4","52":"C5","53":"Db5","54":"D5","55":"Eb5","56":"E5","57":"F5","58":"Gb5","59":"G5","60":"Ab5","61":"A5","62":"Bb5","63":"B5","64":"C6","65":"Db6","66":"D6","67":"Eb6","68":"E6","69":"F6","70":"Gb6","71":"G6","72":"Ab6","73":"A6","74":"Bb6","75":"B6","76":"C7","77":"Db7","78":"D7","79":"Eb7","80":"E7","81":"F7","82":"Gb7","83":"G7","84":"Ab7","85":"A7","86":"Bb7","87":"B7","88":"C8","89":"Db8","90":"D8","91":"Eb8","92":"E8","93":"F8","94":"Gb8","95":"G8","96":"Ab8","97":"A8","98":"Bb8","99":"B8","100":"C9","101":"Db9","102":"D9","103":"Eb9","104":"E9","105":"F9","106":"Gb9","107":"G9","108":"Ab9","109":"A9","110":"Bb9","111":"B9"};

var keyToNote = {"C1":"4","Db1":"5","D1":"6","Eb1":"7","E1":"8","F1":"9","Gb1":"10","G1":"11","Ab1":"12","A1":"13","Bb1":"14","B1":"15","C2":"16","Db2":"17","D2":"18","Eb2":"19","E2":"20","F2":"21","Gb2":"22","G2":"23","Ab2":"24","A2":"25","Bb2":"26","B2":"27","C3":"28","Db3":"29","D3":"30","Eb3":"31","E3":"32","F3":"33","Gb3":"34","G3":"35","Ab3":"36","A3":"37","Bb3":"38","B3":"39","C4":"40","Db4":"41","D4":"42","Eb4":"43","E4":"44","F4":"45","Gb4":"46","G4":"47","Ab4":"48","A4":"49","Bb4":"50","B4":"51","C5":"52","Db5":"53","D5":"54","Eb5":"55","E5":"56","F5":"57","Gb5":"58","G5":"59","Ab5":"60","A5":"61","Bb5":"62","B5":"63","C6":"64","Db6":"65","D6":"66","Eb6":"67","E6":"68","F6":"69","Gb6":"70","G6":"71","Ab6":"72","A6":"73","Bb6":"74","B6":"75","C7":"76","Db7":"77","D7":"78","Eb7":"79","E7":"80","F7":"81","Gb7":"82","G7":"83","Ab7":"84","A7":"85","Bb7":"86","B7":"87","C8":"88","Db8":"89","D8":"90","Eb8":"91","E8":"92","F8":"93","Gb8":"94","G8":"95","Ab8":"96","A8":"97","Bb8":"98","B8":"99","C9":"100","Db9":"101","D9":"102","Eb9":"103","E9":"104","F9":"105","Gb9":"106","G9":"107","Ab9":"108","A9":"109","Bb9":"110","B9":"111"};

var status = "main";
var mode = "presong";

function loadInstrument(inst, success){
    MIDI.loadPlugin({
		soundfontUrl: "soundfont/",
		instrument: inst,
		onsuccess: success
	});
}

var choice = "acoustic_grand_piano"; // instrument of choice;
function instrumentChange(){
	IntervalManager.clearAll();
    choice = $('.instrumentSelector').find(":selected")[0].value;
    if (eval("MIDI.Soundfont." + choice) == undefined){ // instrument not found
        loadInstrument(choice, function(){
            MIDI.programChange(0, instruments.indexOf(choice));
			testScale();
        });
    }
    else{ // instrument is found
        MIDI.programChange(0, instruments.indexOf(choice));
		testScale();
    }
    scale.vol = baseVelocetys[instruments.indexOf($('.instrumentSelector').find(":selected")[0].value)]; // sets the volume of the scale to the proper number as listed by the baseVelocetys variable.
}

var presetUsed = 0;
function presetChange(){
	IntervalManager.clearAll();;
    presetUsed = parseInt($('#presetSelector').find(":selected")[0].value);
    scale = jQuery.extend(true, {}, presets[presetUsed].data) ;
    for (var i = 1; i <= 16; i++){
        var noteInfo = document.getElementById("T" + i);
        noteInfo.value = scale["T" + i];
        noteInfo.onchange();
    }
    scale.vol = baseVelocetys[instruments.indexOf($('.instrumentSelector').find(":selected")[0].value)]; // sets the volume of the scale to the proper number as listed by the baseVelocetys variable.
	testScale();
}

function testScale(){
	playerIntervalSetter();
}

function scaleInfo(){
    status = "scale";
    
    loadInstrument("acoustic_grand_piano", playerIntervalSetter());
    
    messageOn("<h2>Select Scale: </h2>" + infoMaker());
    var saveNotes = jQuery.extend(true, {}, testNoteArray); // make a deep copy of the current note arragenemnt
    lightTestNotes();
    testNoteArray = saveNotes;
}

function infoMaker(){
    var info = "";
    
	info = info + '<div class="dropdownBox">';
	
	info = info + '<img src="img/icons/Play.png" width="48" height="48" alt="Test Scale" class="controllButtons" onclick="testScale()" style="margin-right: 23px" title="Test the current scale">';
	
	info = info + "</div>";
	
    info = info + '<div class="dropdownBox"><h4 class="presetLable">Select Preset:</h4><select id="presetSelector" onchange="presetChange()">';
    for (var i = 0; i < presets.length; i++){
        if (i == presetUsed){
            info = info + '<option value="' + i + '" selected>' + presets[i].preset + '</option>';
        }
        else{
            info = info + '<option value="' + i + '">' + presets[i].preset + '</option>';
        }
    }
    info = info + '</select></div>'
    
    info = info + '<div class="dropdownBox"><h4 class="instrumentSelector presetLable">Select Instrument:</h4><select class="instrumentSelector" onchange="instrumentChange()">'
    for (var i = 0; i<instruments.length; i++){
        var displayText = instruments[i];
        
        if (instruments[i] == "gunshot"){
            displayText = "precussion_kit";
        }
        
        if (instruments[i] != choice){
            info = info + '<option value="' + instruments[i] + '" >'+ displayText + '</option>';
        }
        if (instruments[i] == choice){
            info = info + '<option value="' + instruments[i] + '" selected>'+ displayText + '</option>';
        }
    }
    
    info = info + '</select></div>';
    
    info = info + '<div class="clickyBox">';
    
    for (var i = 1; i<=16; i++){
        info=info + '<div class="noteBox">';
        info = info + "<input id=\"N" + i + "\" type=\"text\" class=\"scaleInput\" value=\"" + noteToKey[eval("scale.T"+i)] + "\" onchange=\"keyUpdate(this)\" maxlength=\"3\">";
        info = info + "<input id=\"T" + i + "\" type=\"number\" min=\"21\" max=\"108\" class=\"scaleInput\" value=\"" + eval("scale.T"+i) + "\" onchange=\"scaleUpdate('T" + i + "')\">";
        for (var j = 1; j<=16; j++){
            info=info+'<div class="testNote" id="R'+ i + 'C' + j + '" onclick="note(this)"></div>';
        }
        info=info + "</div><br>";
    }
    
    info = info + "</div>";
    
    return info;
}



function keyUpdate(ele){
    ele.value = formatKey(ele.value);
    var changeTarget = document.getElementById(ele.id.replace("N", "T"));
    if (typeof keyToNote[ele.value] != "undefined"){
        changeTarget.value = keyToNote[ele.value];
        changeTarget.onchange();
    }
    else{
        ele.value = noteToKey[changeTarget.value];
    }
}

function formatKey(val){
    val = val.toUpperCase();
    if (val.length >1 ){
        val = val.replaceAt(1, val[1].toLowerCase());
    }
    return val;
}

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

function note(ele){
    //console.log(ele);
    //console.log(ele.className)
    if (ele.className == "testNote"){
        ele.className = ele.className + " " + "selected";
    }
    else{
        ele.className = "testNote";
    }
    var id = ele.id;
    var corrispondingCollum = parseInt( id.substring(id.indexOf("C")+1));
    var corrispondingRow =  parseInt( id.substring(id.indexOf("R")+1, id.indexOf("C")));
    if (testNoteArray[corrispondingCollum].indexOf("T" + corrispondingRow) == -1){
        testNoteArray[corrispondingCollum].push("T" + corrispondingRow);
        if (corrispondingCollum == 16){
            testNoteArray[0].push("T" + corrispondingRow);
        }
    }
    else{
        testNoteArray[corrispondingCollum].splice(testNoteArray[corrispondingCollum].indexOf("T" + corrispondingRow), 1);
        if (corrispondingCollum == 16){
            testNoteArray[0].splice(testNoteArray[0].indexOf("T" + corrispondingRow), 1);
        }
    }
}

function scaleUpdate(eleid){
    var newVal = document.getElementById(eleid).value;
    var targetNote = document.getElementById(eleid.replace("T","N"));
    scale[eleid] = parseInt(newVal);
    targetNote.value = noteToKey[scale[eleid]];
}

var nps = 8;
function bpsUpdate(){
    nps = parseInt($("#NPS")[0].value);
}

var testNoteArray = [["T1"],["T16"], ["T15"], ["T14"], ["T13"], ["T12"], ["T11"], ["T10"], ["T9"], ["T8"], ["T7"], ["T6"], ["T5"], ["T4"], ["T3"], ["T2"], ["T1"]];
var targetNote = 1;
function noteTest(){
    if (status=="scale"){
		//console.log(targetNote);
        if (targetNote > 16){
            targetNote = 0;
			IntervalManager.clearAll();
        }
		else{
			for (var i = 0; i < testNoteArray[targetNote].length; i++){
				// play the note if it wasn't there on the last collum
				if (testNoteArray[targetNote-1].indexOf(testNoteArray[targetNote][i]) == -1){
					MIDI.noteOn(0,eval("scale." + testNoteArray[targetNote][i]), scale.vol, 0);
				}
			}
			for (var i = 0; i < testNoteArray[targetNote-1].length; i++){
				// stop the note if it isn't here on the this collum
				if (testNoteArray[targetNote].indexOf(testNoteArray[targetNote-1][i]) == -1){
					MIDI.noteOff(0,eval("scale." + testNoteArray[targetNote-1][i]), 0);
				}
			}
		}
        targetNote++;
    }
}

function lightTestNotes(){
    for (var i = 1; i <=16; i++){
        for (var j=0; j<testNoteArray[i].length; j++){
            document.getElementById("R" + testNoteArray[i][j].substring(1) + "C" + i).click();
        }
    }
}

var playerInterval;
function playerIntervalSetter(){
    IntervalManager.set(0, noteTest, 1000/nps);
}

var IntervalManager ={
   
 intervals : [/*28432953637269707465726C61746976652E636F6D*/],
   
 set : function( intervalID, funcRef, period )
 {
  if( !this.intervals[ intervalID ] )  
   this.intervals[ intervalID ] = setInterval( funcRef, period );
  else
   console.log("Attempted to set " + intervalID + ' more than once.');
 },  
   
 clear : function( id )
 {
  clearInterval( this.intervals[ id ] );  
  delete this.intervals[ id ];  
 },
 
 clearAll : function()
 {
  var table = this.intervals;  
    
  for( var i in table )
  {
   clearInterval( table[ i ] );
   delete table[ i ];  
  }      
 },
 
 any : function()
 {
  var table = this.intervals, found = false;  
  
  for( var i in table )
   if( table[ i ] !== null )
   {
    found = table[ i ];  
    break;  
   }
    
  return found;
 }   
}

// ---------------------------------------------------------------
// song initiation methods
// ---------------------------------------------------------------

var songName = "";
var trackCount = 0;
function initializeSong(){
    var windowWidth = $(window).width();
    var initializeAnyways = false;
    
    if (windowWidth <= 800){
        initializeAnyways = confirm("We have detected that your screen is small and is, therefore, likely that you are using a mobile browser. If you are using a mobile browser, it is likely that nothing will work and your browser may shutdown. Are you sure you want to continue?");
        if (!initializeAnyways){
            return false;
        }
    }
    else{
        initializeAnyways = true;
    }
	
	//console.log(document.getElementById("songName").value == "");
	if (document.getElementById("songName").value == ""){ 
		songName = "New Song" ;
	}
	else {
		songName = document.getElementById("songName").value;
		songName = songName.replace(/'/g, "\\'");
	}
	
	if (song.track15.songData.length == 0){
		messageOn("<p>Loading please wait</p>", "", false, "Ok")
		setTimeout(function(){
			//setting global variables
			mode="initialized";
			scrollMode = "horiz";
			
			//switching viewing mode over
			document.getElementById("mainbody").className = "hide";
			document.getElementById("songBody").className = "songBody";
			
			//get global variables to use
			var songSec = 2;
			if (!isNaN(parseInt(document.getElementById("songLength").value))){
				songSec = songSec + parseInt(document.getElementById("songLength").value)*60;
			}
			if (!isNaN(parseInt(document.getElementById("songSec").value))){
				songSec = songSec + parseInt(document.getElementById("songSec").value);
			}
			//songName = document.getElementById("songName").value;

			// Update banner
			document.getElementById("bannerheader").appendChild(document.createTextNode(" - " + songName));
			
			//build data structure
			song.metaData.length = songSec; // seconds
			song.metaData.nps = nps;
			song.metaData.name = songName;
			
			//build visual rig
			buildTrack("track" + trackCount, songSec, nps, choice, scale, "");
			var slider = document.getElementById("timeLine");
			slider.style.width = (songSec*nps*23)-13 + "px";
			slider.setAttribute("max", (songSec*nps).toString());
			
			//loading compleate clean up time
			trackCount++;
			
			var currentUser = "";
            if (typeof loginCookie == "undefined" || loginCookie.uName == "" || typeof loginCookie.uName == "undefined" ){
                currentUser = "Guest";
            }
			else{
				currentUser = loginCookie.uName;
			}
            $.post("services/usageTracker.php", {name:currentUser, song:song.metaData.name, len:song.metaData.length }, function(data){
                console.log("thank you for using Music Matrix Composer v2");
                console.log(data);
            });
		}, 100);
	}
	else{
		messageOn("<p>Due to technical restraints, you can only have 16 tracks. Sorry about this. </p>");
	}
    return false;
}

function loadTune(targetTrack, melody){
    //console.log(melody);
    if (typeof melody[0][0] == "string" || typeof melody[0][0] == "undefined"){ // using old convention without volume data
        for (var i = 1; i < melody.length; i++){
            loadCollum(targetTrack, melody[i], i);
        }
    }
    else{
        for (var i = 1; i < melody.length; i++){
            loadCollumAdvanced(targetTrack, melody[i], i);
        }
    }
}

function loadCollum(targetTrack, collumNotes, collumOn){
    for (var i = 0; i < collumNotes.length; i++){
        var preID = {"ParentTrack":targetTrack, "tone": parseInt(collumNotes[i].substring(1)), "collum":collumOn};
        //console.log(document.getElementById(JSON.stringify(preID)));
        toggle(document.getElementById(JSON.stringify(preID)));
    }
}

function loadCollumAdvanced(targetTrack, collumNotes, collumOn){
    for (var i = 1; i < collumNotes.length; i++){
        var preID = {"ParentTrack":targetTrack, "tone": parseInt(collumNotes[i].substring(1)), "collum":collumOn};
		//console.log(document.getElementById(JSON.stringify(preID)));
		if ( document.getElementById(JSON.stringify(preID)) != undefined){
			//console.log(document.getElementById(JSON.stringify(preID)));
			toggle(document.getElementById(JSON.stringify(preID)));
		}
    }
    //console.log(targetTrack, collumNotes[0], collumOn);
    levelsKeyframe(targetTrack, collumNotes[0], collumOn);
}

function levelsKeyframe(target, vols, collum){

    if (vols.vol > -1){
        var checkbox = $("#" + target + "-VolumeBoxCheck" + collum);
        var slider = $("#" + target + "-VolumeBoxSlider" + collum);
        checkbox.change();
        slider[0].value = vols.vol;
        slider.mouseup();
    }
}

var totalTracksToLoad = 1;
function loadSong(songID){
    messageOn("<p>Loading please wait</p>", "", false, "Ok");
    $.post("services/songTracks.php", {name:loginCookie.uName, sessionID:loginCookie.sessionID, songID: savedSongs[songID].songID}, function(data){
        //console.log(data);
        var tracks = JSON.parse(data);
        var numberOfTracks = Object.keys(tracks).length;
        
        //setting global variables
        mode="initialized";
        scrollMode = "horiz";
        
        //switching viewing mode over
        document.getElementById("mainbody").className = "hide";
        document.getElementById("songBody").className = "songBody";
        
        var songSec = savedSongs[songID].length;
        nps = savedSongs[songID].nps
        songName = savedSongs[songID].name;

        // Update banner
        document.getElementById("bannerheader").appendChild(document.createTextNode(" - " + songName));
        
        //build data structure
        song.metaData.length = songSec; // seconds
        song.metaData.nps = nps;
        song.metaData.name = songName.replace(/'/g, "\\'");
        song.metaData.songID = savedSongs[songID].songID;
        
        //disable looper to prevent bad loading
        loop = 0;
        document.getElementById("looperNumber").innerHTML = loop;
        
        totalTracksToLoad = numberOfTracks; // helps with telling the program when to turn off the loading sign
        clickSound = false;
        //build the tracks
        for (var i = 0; i < numberOfTracks; i++){
            var trackName = "track"+i;
            buildTrack(trackName, songSec, nps , tracks[trackName].instrument, tracks[trackName].scale, parseInt(tracks[trackName].id));
            //console.log(tracks[trackName].songData);
            loadTune(trackName, tracks[trackName].songData);
            trackCount++;
        }
        clickSound = true;
        
        // slider stuff
        var slider = document.getElementById("timeLine");
        slider.style.width = (songSec*nps*23)-13 + "px";
        slider.setAttribute("max", (songSec*nps).toString());
        
        loadQuotes(songID);
        
        var currentUser = "";
        if (typeof loginCookie == "undefined" || loginCookie.uName == "" || typeof loginCookie.uName == "undefined" ){
            currentUser = "Guest";
        }
		else{
			currentUser = loginCookie.uName;
		}
        $.post("services/usageTracker.php", {name:currentUser, song:song.metaData.name, len:song.metaData.length }, function(data){
            console.log("thank you for using Music Matrix Composer v2");
			console.log(data);
        });
        
    });
}

function showSong(inDBSongID){
    $.post("services/getPublicSongById.php", {inDBSongID: inDBSongID}, function(data){
        if (data != "{}"){
            publicRecentSongs = JSON.parse(data);
            loadPublicSong("song0");
        }
    });
}

function loadPublicSong(saveID){
    messageOn("<p>Loading please wait</p>", "", false, "Ok");
    $.post("services/songTracks.php", {songID: publicRecentSongs[saveID].songID}, function(data){
        //console.log(data);
        var tracks = JSON.parse(data);
        var numberOfTracks = Object.keys(tracks).length;
        
        //setting global variables
        mode="initialized";
        scrollMode = "horiz";
        
        //switching viewing mode over
        document.getElementById("mainbody").className = "hide";
        document.getElementById("songBody").className = "songBody";
        
        var songSec = publicRecentSongs[saveID].length;
        nps = publicRecentSongs[saveID].nps
        songName = publicRecentSongs[saveID].songName;

        // Update banner
        document.getElementById("bannerheader").appendChild(document.createTextNode(" - " + songName));
        
        //build data structure
        song.metaData.length = songSec; // seconds
        song.metaData.nps = nps;
        song.metaData.name = songName.replace(/'/g, "\\'");
        song.metaData.songID = publicRecentSongs[saveID].songID;
        
        //disable looper to prevent bad loading
        loop = 0;
        document.getElementById("looperNumber").innerHTML = loop;
        
        totalTracksToLoad = numberOfTracks; // helps with telling the program when to turn off the loading sign
        clickSound = false;
        //build the tracks
        for (var i = 0; i < numberOfTracks; i++){
            var trackName = "track"+i;
            buildTrack(trackName, songSec, nps , tracks[trackName].instrument, tracks[trackName].scale, parseInt(tracks[trackName].id));
            //console.log(tracks[trackName].songData);
            loadTune(trackName, tracks[trackName].songData);
            trackCount++;
        }
        clickSound = true;
		
        // slider stuff
        var slider = document.getElementById("timeLine");
        slider.style.width = (songSec*nps*23)-13 + "px";
        slider.setAttribute("max", (songSec*nps).toString());
        
        //loadQuotes(songID);
        
        var currentUser = "";
        if (typeof loginCookie == "undefined" || loginCookie.uName == "" || typeof loginCookie.uName == "undefined" ){
            currentUser = "Guest";
        }
		else{
			currentUser = loginCookie.uName;
		}
        $.post("services/usageTracker.php", {name:currentUser, song:song.metaData.name, len:song.metaData.length }, function(data){
            console.log("thank you for using Music Matrix Composer v2");
			console.log(data);
        });
        
    });
}

function loadQuotes(songID){
    $.post("services/songQuotes.php", {name:loginCookie.uName, sessionID:loginCookie.sessionID, songID: savedSongs[songID].songID}, function(data){
        //console.log(JSON.parse(data));
        combos = JSON.parse(data);
    });
}

function trackRetime(newNPS, newDuration){
	if (newNPS == undefined){
		newNPS = parseInt(document.getElementById("newNPS").value);
	}
	if (newDuration == undefined){
		newDuration = parseInt(document.getElementById("newDurationMin").value)*60 + parseInt(document.getElementById("newDurationSec").value);
	}
	
	var preEditSong = jQuery.extend(true, {}, song);
	messageOn("<p>Loading please wait</p>", "", false, "Ok");
	//console.log(song);
	
	if (newDuration*newNPS < preEditSong.metaData.length*preEditSong.metaData.nps){
		if (!confirm("You have choose to reduce the number of notes you have to work with. You might lose part of your song if you do continue with this opperation. It is suggested that you save before continueing. Are you sure you want to do this?")){
			return;
		}
	}
			
	// clear data in song
	song={
		"track0":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track1":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track2":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track3":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track4":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track5":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track6":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track7":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track8":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track9":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track10":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track11":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5},
		"track12":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track13":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track14":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"track15":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
		"metaData":{"length":"", "name":"", "nps":"", "songID":""},
		"player":{
			"track0Data":[],
			"track1Data":[],
			"track2Data":[],
			"track3Data":[],
			"track4Data":[],
			"track5Data":[],
			"track6Data":[],
			"track7Data":[],
			"track8Data":[],
			"track9Data":[],
			"track10Data":[],
			"track11Data":[],
			"track12Data":[],
			"track13Data":[],
			"track14Data":[],
			"track15Data":[]
		}
	};
	
	// remove the tracks from the work area.
	$(".track").remove();
	var numberOfTracks = trackCount;
	
	// build metadata of the track
	song.metaData.length = newDuration; // seconds
	song.metaData.nps = newNPS;
	song.metaData.name = preEditSong.metaData.name;
	song.metaData.songID = preEditSong.metaData.songID;
	
	//disable looper to prevent bad loading
	loop = 0;
	document.getElementById("looperNumber").innerHTML = loop;
	
	// get rid of clicksounds to not sound annoying.
	clickSound = false;
	
	// clean up trackcount so the program doesn't go overboard with thinking it has too may tracks
	trackCount = 0;
	// dropped this in from load song with a twist
	for (var i = 0; i < numberOfTracks; i++){
		var trackName = "track"+i;
		buildTrack(trackName, newDuration, newNPS , preEditSong[trackName].instrument, preEditSong[trackName].scale, parseInt(preEditSong[trackName].id));
		//console.log(tracks[trackName].songData);
		loadTune(trackName, preEditSong[trackName].songData);
		trackCount++;
	}
	totalTracksToLoad = numberOfTracks; // helps with telling the program when to turn off the loading sign
	clickSound = true;
	
	var slider = document.getElementById("timeLine");
	slider.style.width = (newDuration*newNPS*23)-13 + "px";
	slider.setAttribute("max", (newDuration*newNPS).toString());
}

var tracksLoaded = 0;
function buildTrack(trackname, duration, pacing, tool, songScale, trackID){
	//var offFlag = false;
    // build the interface representation of the track
    var trackBody = document.createElement("div");
    trackBody.id = trackname;
    trackBody.className = "track";
	trackBody.setAttribute( "style", "top: " + (15 + parseInt(trackname.replace("track", ""))*(371+15)) + "px;");
    trackBody.style.width= (duration*pacing*23)+3+100 + "px";
    document.getElementById("songBody").appendChild(trackBody);
    
    var toolBar = document.createElement("div");
    toolBar.id = trackname + "-ToolBar";
    toolBar.className = "trackTools";
	toolBar.setAttribute("onmouseover", "colorSolid(this)");
	toolBar.setAttribute("onmouseout", "colorFade(this)");
	toolBar.setAttribute("style", "opacity:1.0;");
    trackBody.appendChild(toolBar);
    
    var matrixBox = document.createElement("div");
    matrixBox.id= trackname + "-MatrixBox";
    matrixBox.className="matrixBox";
    matrixBox.style.width= (duration*pacing*23)+2 + "px";
    matrixBox.setAttribute("oncontextmenu", "return false");
    trackBody.appendChild(matrixBox);
    
    var volumeBox = document.createElement("div");
    volumeBox.id=trackname + "-VolumeBox";
    volumeBox.className="matrixBox hide";
    volumeBox.style.width= (duration*pacing*23)+3 + "px";
    trackBody.appendChild(volumeBox);
    addLevelsField(volumeBox);
    
    var floatClear = document.createElement("div");
    floatClear.className = "floatClear";
    trackBody.appendChild(floatClear);
    
    //build the data structure of the track
    var dataArray = song[trackname].songData;
    for (var i = 0; i <= duration*pacing; i++){ // song data starts at note 1. note 0 is for house keeping.
        dataArray.push([{"vol":-1}]);
		song.player[trackname + "Data"].push([]);
    }
    
    // double checks that the volume part of the scale is there
    songScale["vol"] = baseVelocetys[instruments.indexOf(tool)];
    
    song[trackname].scale = jQuery.extend(true, {}, songScale); //makes a deep copy of the scale and keeps it in storage.
    song[trackname].id = trackID;
    
    var midiChannel = parseInt(trackname.replace("track", ""));
    //update data structure with instrument info
    song[trackname].instrument=tool;
    if (eval("MIDI.Soundfont." + tool) == undefined){ // soundfont not loaded
        loadInstrument(tool, function(){//load the instrument's soundfont
            MIDI.programChange(midiChannel, instruments.indexOf(tool));//when loading is done, switch the channel this track is on to the right channel
            tracksLoaded++;
            if (tracksLoaded == totalTracksToLoad){
                messageOff();
				//offFlag = true;
            }
            //console.log("program change happened for " + trackname);
        });
    }
    else { //soundfont already loaded
		//alert(midiChannel + " " + instruments.indexOf(tool));
        MIDI.programChange(midiChannel, instruments.indexOf(tool)); //change track to have an instrument
        tracksLoaded++;
		if (tracksLoaded == totalTracksToLoad){
			messageOff();
			//offFlag = true;
		}
        console.log("program change happened for " + trackname);
    }
    
    // build box interface structure
    populateBox(trackname, duration*pacing, matrixBox);
	
	// at the end, add the track's title to the toolbar
	var trackTitle = document.createElement("p");
	//console.log(trackname);
	if (song[trackname].instrument != "gunshot"){
		trackTitle.innerHTML = toTitleCase(replaceAll("_", " ", song[trackname].instrument));
	}
	else{
		trackTitle.innerHTML = "Drum Kit";
	}
	trackTitle.className = "trackTitle";
	trackTitle.id = trackname + "-Title";
	toolBar.appendChild(trackTitle);
    
	// make the volume switch after the title
    var volumeSwitch = document.createElement("img");
    volumeSwitch.id=trackname + "volumeSwitch";
    volumeSwitch.src = "img/icons/levels.png";
    volumeSwitch.className = "toolBarButtons";
    volumeSwitch.alt = "Control levels on " + trackname;
    volumeSwitch.setAttribute("onclick", "manageLevels(this, '" + trackname + "')");
	volumeSwitch.title = "Levels Adjuster";
    toolBar.appendChild(volumeSwitch);
    
	// then add the track settings
    var trackSettings = document.createElement("img");
    trackSettings.id=trackname + "settings";
    trackSettings.src = "img/icons/Settings.png";
    trackSettings.className = "toolBarButtons";
    trackSettings.alt = "Advanced settings for " + trackname;
    trackSettings.setAttribute("onclick", "trackSettings('" + trackname + "')");
	trackSettings.title="Advanced Track Settings";
    toolBar.appendChild(trackSettings);

    // then add the delete track button
    var deleteButton = document.createElement("img");
    deleteButton.id=trackname + "delete";
    deleteButton.src = "img/icons/Delete.png";
    deleteButton.className = "toolBarButtons";
    deleteButton.alt = "Delete  " + trackname;
    deleteButton.setAttribute("onclick", "delTrackConfirm('" + trackname + "')");
    deleteButton.title="Delete Track";
    toolBar.appendChild(deleteButton);
	
}

function populateBox(trackName, number, container){ // this is where the track gets made
    for (var i = 1; i <=16; i++){
        /*var row = document.createElement("div");
        row.id = trackName + "-R" + i;
		row.className="toneRow";
        container.appendChild(row);*/
        
        populateRow(number, container, i, trackName); //create rows
    }
}

function populateRow(count, target, virtNumber, trackName){
    for (var i = 1; i <=count; i++){
        target.appendChild(box(i, virtNumber, trackName)) // creates collums per row
    }
    var floatClear = document.createElement("div");
    floatClear.className = "floatClear";
    target.appendChild(floatClear);
    //console.log ("created a row of " + count + " blocks");
}

function box(x, y, trackName){ // this is where each block gets made
    var box = document.createElement("div");
    box.className = "note";
	if (x % song.metaData.nps == 1){
		if (x % (song.metaData.nps*2) == 1){ // make green bar once per bar
			box.className = box.className + " note16";
		}
		else{
			if(y == 16 || y == 1){
				box.className = box.className + " note16";
			}
		}
	}
    var information = {"ParentTrack":trackName, "tone":y, "collum":x};
    box.id = JSON.stringify(information);
    box.setAttribute("onmousedown","toggle(this, true, event)");
    box.setAttribute("onmouseenter","drag(this, event)");
    box.setAttribute("oncontextmenu", "return false");
    return box;
}

function addLevelsField(target){
    for (var i = 1; i <= song.metaData.length * song.metaData.nps; i++){
        var div = document.createElement("div"); 
        div.className = "sliderBlock";
        target.appendChild(div);
        
        var checkBox = document.createElement("input");
        checkBox.type="checkbox";
        checkBox.className="keyframeSelect";
        checkBox.id=target.id + "Check" + i;
        checkBox.setAttribute("onchange", "levelKeyframe(this, '" + target.id + "Slider" + i + "', " + i + ")");
        div.appendChild(checkBox);
        
        var br = document.createElement("br")
        div.appendChild(br);
        
        /*
    }
    for (var i = 1; i <= song.metaData.length * song.metaData.nps; i++){*/ 
    
        
        var slider = document.createElement("input");
        slider.type = "range";
        slider.className = "volumeKeyframe hide";
        slider.max="1";
        slider.min="0.00";
        slider.step="0.01";
        slider.value="0.5";
        slider.id=target.id + "Slider" + i;
        slider.setAttribute("onmouseup", "levelSlide(this, " + i + ")");
        div.appendChild(slider);
    }
}

var dragging = false;
//var quotePotential = [];
function drag(ele, e){
    //console.log(e);
    if (dragging){
        clickSound = false;
        jsonData = toggle(ele, true, e);
        clickSound = true;
    }
    else{
        var jsonData = JSON.parse(ele.id);
        var tone = jsonData.tone;
        var noteNumber = song[jsonData.ParentTrack].scale["T" + tone];
		var noteData = "Piano Note: " + noteToKey[noteNumber] + " / Midi Key: " + MIDI.noteToKey[noteNumber];
		noteData += " / Time: " + secToMin( Math.floor( (jsonData.collum-1)/song.metaData.nps)) + (jsonData.collum-1)%song.metaData.nps + "/" + song.metaData.nps + ")";
        ele.setAttribute("title", noteData);
    }
	if (quoteCombo >= 0){
		$(".comboTrial").removeClass("comboTrial");
		for (var i = 0; i < combos[quoteCombo].noteDeltas.length; i++){
			var targetData = JSON.parse(ele.id);
			targetData.tone += combos[quoteCombo].noteDeltas[i].toneOffset;
			targetData.collum += combos[quoteCombo].noteDeltas[i].collumOffset;
			var queryString = "div[id*='" + JSON.stringify(targetData) + "']";
			//console.log(queryString);
			$(queryString).addClass("comboTrial");
		}
	}
}

function secToMin(sec){
	return Math.floor(sec/3600) + "hr:" + Math.floor(sec/60) + "min:" + sec%60 + "sec:(";
}

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// ---------------------------------------------------------------
// song composing methods
// ---------------------------------------------------------------

var song={
    "track0":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track1":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track2":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track3":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track4":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track5":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track6":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track7":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track8":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track9":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track10":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track11":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5},
    "track12":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track13":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track14":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "track15":{"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}, 
    "metaData":{"length":"", "name":"", "nps":"", "songID":""},
	"player":{
		"track0Data":[],
		"track1Data":[],
		"track2Data":[],
		"track3Data":[],
		"track4Data":[],
		"track5Data":[],
		"track6Data":[],
		"track7Data":[],
		"track8Data":[],
		"track9Data":[],
		"track10Data":[],
		"track11Data":[],
		"track12Data":[],
		"track13Data":[],
		"track14Data":[],
		"track15Data":[],
	}/*,
	
	"test" : function(){
		var obj=this, prop;
		for (prop in obj){
			console.log(obj[prop]);
		}
	}*/
};

var combos = [];
var comboTemplate = {"id": "", "comboName":"" , "noteDeltas": [], "inUse": true};

var loop = 16;
function looper(){
    if (loop < 2){
        messageOn("<p>Repeat input every <input id=\"loopNumber\" type=\"number\" min=\"2\" onkeydown=\"if (event.keyCode == 13) {loopUpdate();messageOff();}\"> notes </p><p>Hint: 1 second =" + song.metaData.nps + " notes and one bar = 2 seconds</p>", "loopUpdate();messageOff();", true, "ok");
        document.getElementById("loopNumber").focus();
    }
    else{
        loop = 0;
        document.getElementById("looperNumber").innerHTML = loop;
        messageOn("<p>You have disabled the input repeater function</p>")
    }
}

function loopUpdate(){
    loop = parseInt(document.getElementById("loopNumber").value);
    document.getElementById("looperNumber").innerHTML = loop;
}

var clickSound = true;
function toggleClickSound(){
    clickSound = !clickSound;
}

function toggle(ele, looping, e){
	if (!phraseCreate){
		if (typeof e == "undefined" || e.button != 1){
			var information = JSON.parse(ele.id);
			var toneExists = song[information.ParentTrack].songData[information.collum].indexOf("T" + information.tone);
			//noteContext(ele);
			if ( toneExists == -1){ // cant find the tone in the current data structure aka we are adding something.
				song[information.ParentTrack].songData[information.collum].push("T" + information.tone); //adding the tone to the data structure.
				
				switch(noteContext(ele)) { // updating notes in the new data Structure
					case 0:
						// add new note 
						efficientNoteAdd(information);
						break;
					case -1: 
						// extend note by 1
						efficientNoteFindPrevious(information).duration++;
						//console.log(efficientNoteFindPrevious(information));
						//prevNote.duration = prevNote.duration + 1;
						break;
					case 1:
						// move note forward by 1 and lengthen
						information.collum++;
						var oldDuration = efficientNoteRemove(information);
						information.collum--;
						efficientNoteAdd(information, 1+oldDuration);
						break;
					case 2:
						var prevNote = efficientNoteFindPrevious(information);
						information.collum++;
						var behindDuration = efficientNoteRemove(information);
						prevNote.duration = prevNote.duration + 1 + behindDuration;
						// merge 2 notes
						break;
				}

				//update graphical stuff
                var volume = song[information.ParentTrack].songData[information.collum][0].vol;
                volume = (volume === -1) ? 0.5 : volume; // Use default value of 0.5 if volume is not set
                var noteColor = colorNoteBox(ele, volume);

                ele.style.backgroundColor= noteColor;
				if (information.collum == (song[information.ParentTrack].songData.length-1)){ //if this is somehow the final note in the array
					song[information.ParentTrack].songData[0].push("T" + information.tone);
				}
				
				//make the sound of the thing on click
				if (clickSound){
					var trackIndex = parseInt(information.ParentTrack.replace("track", ""));
					MIDI.noteOn(trackIndex, song[information.ParentTrack].scale["T" + information.tone], 127, 0);
					MIDI.noteOff(trackIndex, song[information.ParentTrack].scale["T" + information.tone], 0.1);
				}
			}
			else{ // cut the tone out of the data structure aka we are taking something out...
				song[information.ParentTrack].songData[information.collum].splice(toneExists, 1);
				
				switch(noteContext(ele)) { // updating notes in the new data Structure
					case 0:
						// remove this note
						efficientNoteRemove(information);
						break;
					case -1:
						// shorten note infront by 1
						efficientNoteFindPrevious(information).duration--;
						break;
					case 1:
						// move note back by 1
						var oldDuration = efficientNoteRemove(information);
						information.collum++;
						efficientNoteAdd(information, oldDuration-1);
						break;
					case 2:
						// split note
						var bigNote = efficientNoteFindPrevious(information);
						var bigNoteDuration = bigNote.duration;
						var bigNoteDistance = bigNote.distance;
						information.collum -= bigNoteDistance;
						//console.log (information);
						efficientNoteRemove(information);
						efficientNoteAdd(information, bigNoteDistance);
						var bigNoteRemainder = bigNoteDuration-bigNoteDistance-1;
						information.collum+=(bigNoteDistance+1);
						efficientNoteAdd(information, bigNoteRemainder);
						break;
				}

                ele.style.backgroundColor= ''; // Clear color from having been selected

				if (information.collum == (song[information.ParentTrack].songData.length-1)){ //if this is somehow the final note in the array
					song[information.ParentTrack].songData[0].splice(toneExists, 1);
				}
			}
			if (typeof e != "undefined" && e.button == 2){
				e.preventDefault();
				if (loop > 1 && typeof looping == "undefined" ){
					looping = true;
				}
				if (loop == 0 || loop == 1){
					looping = false;
				}
				if (looping){
					clickSound = false;
					for (var i = (information.collum + loop) ; i  < song[information.ParentTrack].songData.length; i = i+loop){
						information.collum = i;
						toggle(document.getElementById(JSON.stringify(information)), false);
					}
					clickSound = true;
				}
			}
		}
	}
	else{
		var actualCombo = $(".comboTrial");
		phraseCreate = !phraseCreate;
		clickSound = !clickSound
		for (var i = 0; i < actualCombo.length; i++){
			toggle(actualCombo[i], false)
		}
		phraseCreate = !phraseCreate;
		clickSound = !clickSound
		actualCombo.removeClass("comboTrial");
		//console.log(e.button);
		if (e.button == 0){
			quoteCombo = -1;
		}
	}
	changedSinceLastTime = true;
}

function efficientNoteAdd(info, duration){
	if (duration == undefined ){
		duration = 1;
	}
	return song.player[info.ParentTrack + "Data"][info.collum].push({"note": "T" + info.tone, "duration": duration, "distance":0});
}

function efficientNoteRemove(info){
	var collumData = song.player[info.ParentTrack + "Data"][info.collum];
	for (var i = 0; i < collumData.length; i++){
		if (collumData[i].note == "T" + info.tone){
			var tempDuration = collumData[i].duration;
			collumData.splice(i, 1);
			return tempDuration;
		}
	}
}

function efficientNoteFindPrevious(info){
	for (var i = info.collum-1; i >= 0; i--){ // search backwards
		var collumData = song.player[info.ParentTrack + "Data"][i];
		//console.log(info);
		for (var j = 0; j < collumData.length; j++){
			//console.log(collumData[j].note, "T" + info.tone);
			if (collumData[j].note == ("T" + info.tone)){
				//console.log("found something");
				collumData[j].distance = info.collum-i;
				return collumData[j];
			}
		}
	}
}

function efficientNoteSetTime(note, newDuration){
	var oldDuration = note.duration;
	note.duration = newDuration;
	return oldDuration-newDuration-1;
}

function noteContext(ele){
	var eleNext = ele.nextSibling;
	var elePrev = ele.previousSibling;
	
	var results = 0;
	
	if (eleNext != null && eleNext.hasAttribute("style")){
		results ++;
	}
	
	if (elePrev != null && elePrev.hasAttribute("style")){
		if (results){
			results++;
		}
		else{
			results--;
		}
	}
	//console.log(results);
	return results;
}

function colorNoteBox(ele, volume){
    var noteColor;
	//console.log(volume);
    if ($.inArray('note16', ele.classList) === 1){
        var green = (170 + (255 - 170) * volume);
        noteColor = '#00'+green.toString(16).substring(0,2)+'00';
    } else {
        var green = Math.round(200 + (-170) * volume);
        var hexGreen = green.toString(16);
        hexGreen = hexGreen.substring(0, 2);
        var blue = Math.round(170 + (-170) * volume);
        var hexBlue =  (blue <= 10) ? '0'+blue.toString(16) : blue.toString(16);
        hexBlue = hexBlue.substring(0, 2);
        noteColor = '#FF'+hexGreen+hexBlue;
    }
    return noteColor;
}

function levelKeyframe(ele, target, index){
    slider = document.getElementById(target);
    if (slider.className.indexOf(" hide") > -1){ // slider is hidden
        slider.className = slider.className.replace(" hide", "");
        
        //add keyframe to datastructure
        targetTrack = target.substring(0, target.indexOf("-"));
        //console.log(targetTrack);
        song[targetTrack].songData[index][0].vol = 0.5;
        if (index == (song[targetTrack].songData.length -1)){ // if this is the last note in the series
            song[targetTrack].songData[0][0].vol = 0.5;
        }
    }
    else{
        slider.className = slider.className + " hide";
        slider.value = 0.5;
        
        //remove keyframe from datastructure
        targetTrack = target.substring(0, target.indexOf("-"));
        //console.log(targetTrack);
        song[targetTrack].songData[index][0].vol = -1;
        if (index == (song[targetTrack].songData.length -1)){ // if this is the last note in the series
            song[targetTrack].songData[0][0].vol = -1;
        }
    }
}

function levelSlide(ele, index){
    //var value = ele.valueAsNumber;
    var targetTrack = ele.id.substring(0, ele.id.indexOf("-"));
    //console.log(value, targetTrack);
    song[targetTrack].songData[index][0].vol = ele.valueAsNumber;
    for (var i = 1; i < 17; i++) {
        var noteID = {"ParentTrack":targetTrack,"tone":i,"collum":index};
        var queryString = "div[id*='" + JSON.stringify(noteID) + "']";
        var selection = $( queryString );
        if (song[targetTrack].songData[index].indexOf("T" + i) !== -1){
            selection.css("background-color", colorNoteBox(selection[0], ele.valueAsNumber));
        }
    };
}

function inputTesting(data){
    console.log(typeof data == "undefined");
}

function playMode(ele){
	serverPlayMode = !serverPlayMode;
	
	if (serverPlayMode){
		ele.innerHTML=ele.innerHTML.replace("Browser", "Server");
	}
	if (!serverPlayMode){
		ele.innerHTML=ele.innerHTML.replace("Server", "Browser");
	}
}

var currentTime = 1;
var songInterval;
var playBtn;
var tracksToPlay = [];
var serverPlayMode = true;
var changedSinceLastTime = true;
function playSong(ele){
    //set default volume of everything to 0.5
    playBtn = ele;
	timelineSlider = document.getElementById("timeLine");
	//currentTime = parseInt(ele.value);
	/*
	if (! serverPlayMode){
		tracksToPlay = [];
		for (var i = 0; i < 16; i++){
			if (song["track" + i].songData.length > 0){
				tracksToPlay.push("track" + i);
			}
		}
		
		for (var i = 0; i <16; i++){
			song["track" + i].lastVolKey = 0.5;
		}
		
		timelineSlider = document.getElementById("timeLine");
		IntervalManager.set(1, efficientPlayer, 1000/song.metaData.nps);
	}
	
	else{
		if (changedSinceLastTime){
			messageOn("Please wait while we get the data from the server. If you would rather not wait, you can switch to browser player mode. Performance will likely take a dip if you do.", "messageOff()", false, "Ok");
			serverPlayerExport(1);
			changedSinceLastTime = false;
		}
		else{
			loadedAndPlay();
		}
		//playerMidiData
		
		//MIDI.Player.currentTime = (currentTime+1/song.metaData.length)*1000;
		
		//currentTime
		
		
	}*/
	var b64ConvertData = buildB64();
	var b64Data = MidiWriter(b64ConvertData);
	
	MIDI.Player.currentData = window.atob(b64Data.b64);
	MIDI.Player.loadMidiFile();
	MIDI.Player.start();
	
    ele.src="img/icons/Stop.png";
    ele.setAttribute("onclick", "stopSong(this)");
	IntervalManager.set(2, slowSync, 1000/song.metaData.nps);
}


//var tempData = "";
function buildB64(){
	tempData = "";
	var file = new Midi.File();
	var ticksPerNote = 256/song.metaData.nps;
	// build the export stuff in 
	index = 0;
	while (song["track"+index].songData.length){
		var b64Track = new Midi.Track();
		file.addTrack(b64Track);
		var trackData = song["track"+index].songData;
		var trackScale = song["track"+index].scale;
		var lastBreak = 0;
		for (var i = 1; i < trackData.length; i++){
			var firstFlag = false;
			var noteContinued = false;
			if (trackData[i][0].vol > -0.5){
				song["track"+index].lastVolKey = trackData[i][0].vol;
			}
			for (var j = 1;j<trackData[i-1].length ;j++){//for every note in the pervious collum
				var previousPitch = MIDI.noteToKey[ trackScale[trackData[i-1][j]]];
				var previousTone = trackData[i-1][j];
				if (trackData[i].indexOf(previousTone) == -1){//if a matching note cant be found on this collum
					//make a noteoff call
					if (!firstFlag){
						b64Track.addNoteOff(index,previousPitch,(i-1-lastBreak)*ticksPerNote);
						firstFlag=true;
						lastBreak = i-1;
						//tempData +="b64Track.addNoteOff("+index+","+previousPitch+","+(i-1-lastBreak)*ticksPerNote+");";
					}
					else{
						b64Track.addNoteOff(index,previousPitch);
						//tempData += "b64Track.addNoteOff("+index+","+previousPitch+");";
					}
				}
				if (trackData[i].indexOf(previousTone) > -1 && i != 1) {
					noteContinued = true;
				}
			}
			/*if (!noteContinued && trackData[i-1].length > 1){ // if note did not continue and there was something in the previous collum
				lastBreak = i-1;
			}*/
			for (var j = 1; j <trackData[i].length; j++){//for every note in the currenc collum
				var currentPitch = MIDI.noteToKey[ trackScale[trackData[i][j]]];
				var currentTone = trackData[i][j];
				if (trackData[i-1].indexOf(currentTone) == -1){ // if there is no note for this note in the previous collum
					if (!firstFlag){//first time on the current time
						b64Track.addNoteOn(index, currentPitch, (i-1-lastBreak)*ticksPerNote, Math.floor(song["track"+index].lastVolKey*song["track"+index].scale.vol));
						firstFlag=true;
						lastBreak = i-1;
						//tempData += " lastVol: "+song["track"+index].lastVolKey + ", scaleVol: " + song["track"+index].scale.vol + " EventAdded: ";
						//tempData += 'b64Track.addNoteOn('+index+','+ currentPitch+','+ (i-1-lastBreak)*ticksPerNote+','+ Math.floor(song["track"+index].lastVolKey*song["track"+index].scale.vol)+');';
					}
					else{
						b64Track.addNoteOn(index, currentPitch, 0, Math.floor(song["track"+index].lastVolKey*song["track"+index].scale.vol));
						//tempData += " lastVol: "+song["track"+index].lastVolKey + ", scaleVol: " + song["track"+index].scale.vol + " EventAdded: ";
						//tempData += 'b64Track.addNoteOn('+index+', '+currentPitch+', 0, '+Math.floor(song["track"+index].lastVolKey*song["track"+index].scale.vol)+');';
					}
					//console.log(song["track"+index].lastVolKey*song["track"+index].scale.vol);
				}
			}
			//alert("comparing: " + JSON.stringify(trackData[i]) + " and " + JSON.stringify(trackData[i-1]) + ". i: "+ i +" lastBreak: " + lastBreak + " noteContinued: " + noteContinued);
			
		}
		song["track"+index].lastVolKey = 0.5;
		index++;
	}
	//console.log(file);
	return file;
}
/*
var s = buildB64();
var sf = MidiWriter(s);
sf.save();
*/

function stopSong(ele){
    IntervalManager.clearAll();
    MIDI.Player.pause();
    ele.src="img/icons/Play.png";
    ele.setAttribute("onclick", "playSong(this)");
	//timelineSlider.value = (currentTime+1).toString();
}

function songPlayer(){
    for (var i = 0; i < 16; i++){
        playNote(i, currentTime, song["track"+i].songData, song["track"+i].scale);
    }
    if (autoScroll){
        //this.scrollLeft -= (23);
        
        var currentLeft = 	$("body").scrollLeft()
    	$("body").animate({scrollLeft: currentLeft + 23}, 0);
    }
    timeUpdate();
}

function playNote(trackNumber, time, trackData, trackScale){
    if (trackData.length <= 1){ //track doesn't exists
        return;
    }
    else{ // track exists
        var currentVol = song["track"+trackNumber].lastVolKey;
        var volume = trackData[time][0].vol;
        if (volume > 0){
            song["track"+trackNumber].lastVolKey = volume;
        }
        currentVol = song["track"+trackNumber].lastVolKey;
        
        for (var i = 1; i < trackData[time].length; i++){
            // play the note if it wasn't there on the last collum
            if (trackData[time-1].indexOf(trackData[time][i]) == -1){
                MIDI.noteOn(trackNumber,trackScale[trackData[time][i]], Math.floor(currentVol*trackScale.vol), 0);
            }
        }
        for (var i = 1; i < trackData[time-1].length; i++){
            // stop the note if it isn't here on the this collum
            if (trackData[time].indexOf(trackData[time-1][i]) == -1){
                MIDI.noteOff(trackNumber,trackScale[trackData[time-1][i]], 0);
            }
        }
    }
}

function efficientPlayer(){
	var i = 0;
	while (song["track"+i].songData.length){
	//for (var i = 0; i < tracksToPlay.length; i++){
		//playNoteEfficiently(tracksToPlay[i], i, currentTime, song["track"+i].songData, song.player["track"+i+"Data"], song["track"+i].scale);
		playNoteEfficiently("track"+i, i, currentTime, song["track"+i].songData, song.player["track"+i+"Data"], song["track"+i].scale);
		i++;
	}
	if (autoScroll){
        //this.scrollLeft -= (23);
        
        var currentLeft = 	$("body").scrollLeft()
    	$("body").animate({scrollLeft: currentLeft + 23}, 0);
    }
	timeUpdate();
}

function playNoteEfficiently(trackName, trackNumber, time, oldTrackData, newTrackData, trackScale){
	//var currentVol = song[trackName].lastVolKey;
	if (oldTrackData[time][0].vol > 0){
		song[trackName].lastVolKey = oldTrackData[time][0].vol;
	}
	//var trackNumber = parseInt(trackName.replace("track", ""));
	//console.log(newTrackData[time]);
	for (var i = 0; i < newTrackData[time].length; i++){
		//console.log(trackNumber, trackScale[newTrackData[time][i].note], Math.floor(song["track"+trackNumber].lastVolKey*trackScale.vol));
		MIDI.noteOn(trackNumber,trackScale[newTrackData[time][i].note], Math.floor(song["track"+trackNumber].lastVolKey*trackScale.vol), 0);
		MIDI.noteOff(trackNumber, trackScale[newTrackData[time][i].note], newTrackData[time].duration*1000/song.metaData.nps );
	}
	//var currentVol = song["track"+trackNumber].lastVolKey;
}

var timelineSlider;
function timeUpdate(){
    if (currentTime >= song.metaData.length * song.metaData.nps){
        currentTime = 0;
        if (!autoLoop){
            stopSong(playBtn);
        }
    }
    
    //timelineSlider.value = (currentTime+1).toString();
    //sliderUpdate(timelineSlider);
	newCurrentTime();
}

function sliderUpdate(ele){
    currentTime = parseInt(ele.value);
	MIDI.Player.currentTime = ((currentTime-1)/song.metaData.nps)*1000;
}

function newCurrentTime(){
	currentTime++;
}

function slowSync(){
	if (!serverPlayMode){
		timelineSlider.value = (currentTime+1).toString();
	}
	else{
		var midiTime = MIDI.Player.currentTime/1000;
		timelineSlider.value = Math.ceil(song.metaData.nps*midiTime);
		
		if (MIDI.Player.endTime - MIDI.Player.currentTime < 50){
			$('[src="img/icons/Stop.png"]').click();
		}
		if (autoScroll){
			var windowWidth = $( window ).width();
			if ((midiTime*23*song.metaData.nps)-(windowWidth/2)>0){
				$("body").scrollLeft((midiTime*23*song.metaData.nps)-(windowWidth/2));
			}
		}
	}
}

var autoScroll = false;
function scrollToggle(ele){
    autoScroll = !autoScroll;
    //console.log(ele);
    if (autoScroll){
        ele.innerHTML = ele.innerHTML.replace("Off", "On");
    }
    else{
        ele.innerHTML = ele.innerHTML.replace("On", "Off");
    }
}

var autoLoop = true;
function loopToggle(ele){
    autoLoop = !autoLoop;
    //console.log(autoLoop);
    if (autoLoop){
        ele.innerHTML = ele.innerHTML.replace("Off", "On");
    }
    else{
        ele.innerHTML = ele.innerHTML.replace("On", "Off");
    } 
}

// ---------------------------------------------------------------
// control button functions
// ---------------------------------------------------------------

function colorSolid(ele){
	var eleCSS = ele.getAttribute("style");
	ele.setAttribute("style",eleCSS.replace("0.7", "1"));
}

function colorFade(ele){
	var eleCSS = ele.getAttribute("style");
	if (scrollLeftDist > 35){
		ele.setAttribute("style",eleCSS.replace("1", "0.7"));
	}
}

function homeButton(){
    messageOn("<p>Unsaved work will be lost.</p><p>click the dark region to return to your work, click ok to continue</p>", "document.location = \"/\"", true, "Got it!");
}

function addTrack(){
    
    status = "scale";
	totalTracksToLoad++;
    
    messageOn("<h2>New Track Scale: </h2>" + infoMaker(), "messageOff(); makeTrack()", true, "Add Track") // creates the advanced settings tab
    
    // puts the diagonal line or whatever other paturn back into the grid
    var saveNotes = jQuery.extend(true, {}, testNoteArray); // make a deep copy of the current note arragenemnt
    lightTestNotes();
    testNoteArray = saveNotes;
    
    // if the default is not loaded load it.
    if (MIDI.Soundfont.acoustic_grand_piano == undefined){
        loadInstrument("acoustic_grand_piano", playerIntervalSetter());
    }
    else{
        playerIntervalSetter();
    }
    MIDI.programChange(0,0);
    // borrow channel 0 on the midi output to do this 
}

function makeTrack(){
    stopSong(document.getElementsByClassName("controllButtons")[0]);
    messageOn("<p>Loading please wait</p>", "", false, "Ok")
    buildTrack("track" + trackCount, song.metaData.length, song.metaData.nps, choice, scale, "");
    trackCount++;
    MIDI.programChange(0, instruments.indexOf(song.track0.instrument)); // revert to what the orginal track had
    messageOff();
}

function delTrackConfirm(trackName){
	if (trackCount == 1){
		messageOn("You only have 1 track right now. Probably shouldn't be deleting your only track");
		return;
	}
    messageOn('<p>Are you sure you wish to delete this track?</p>', "deleteTrack('"+trackName+"');", true, "Delete");
}

var deletedTracks = [];
function deleteTrack(trackName){
	//console.log("messageOff");
	//messageOff();
	console.log("messageOn: loading message")
	messageOn("<p>Deleting in progress. Please wait...</p>", "", false, "ok");
	setTimeout(function(){
		stopSong(document.getElementsByClassName("controllButtons")[0]);
		document.getElementById("songBody").removeChild(document.getElementById(trackName));
		trackCount--;
		totalTracksToLoad--;
		deletedTracks.push(song[trackName].id);
		song[trackName] = {"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5};
		migrateTracks();
		messageOff();
	},100);
}

// Migrates tracks beneath a non-existing track to appropriate slots
// If given an index, start the migration from there
function migrateTracks(index){
    if (!index){
        index = 0;
    }
    // Count of deleted tracks found
    var deletedTracksFound = 0;
    for (; index < trackCount+1; index++) {
        var trackName = 'track'+index;
        var track = song[trackName];
		var efficientTrack = song.player[trackName + "Data"];
        if (track.songData.length == 0){
            deletedTracksFound++;
        } else if (deletedTracksFound > 0) {
            song['track'+(index-deletedTracksFound)] = song[trackName]; // Copy
			song.player['track'+(index-deletedTracksFound)+"Data"] = song.player[trackName + "Data"];
            song[trackName] = {"id":"", "instrument":"", "songData":[], "scale":"", "lastVolKey":0.5}; // Clear
			song.player[trackName+"Data"] = [];
            $('#'+trackName).remove(); // Remove track
            //buildTrack('track'+(index-deletedTracksFound), song.metaData.length, song.metaData.nps, track.instrument, track.scale, parseInt(track.id)); // Rebuild
        }
    }
	trackRetime(song.metaData.nps, song.metaData.length);
}

function jsonCompair(json1, json2){
    if (JSON.stringify(json1) == JSON.stringify(json2)){
        return true;
    }
    return false;
}

function trackSettings(trackName){
    status = "scale";
    choice = song[trackName].instrument;
    scale =  jQuery.extend(true, {}, song[trackName].scale); // make a deep copy of the scale
    
    for (var i = 0; i < presets.length; i++){
        if (jsonCompair(presets[i].data, scale)){
            presetUsed = i;
        }
    }
    
    messageOn("<h2>Track Settings: </h2>" + infoMaker(), "trackUpdate('" + trackName + "')", true, "update");
    
    var saveNotes = jQuery.extend(true, {}, testNoteArray); // make a deep copy of the current note arragenemnt
    lightTestNotes();
    testNoteArray = saveNotes;
    playerIntervalSetter();
    MIDI.programChange(0,instruments.indexOf(song[trackName].instrument)) ;
}

function manageLevels(ele, trackName){
    var matrix = document.getElementById(trackName + "-MatrixBox");
    var levels = document.getElementById(trackName + "-VolumeBox");
    
    if (levels.className.indexOf("hide") > -1){ // found the hide class in levels
        ele.src="img/icons/grid.png";
        levels.className = levels.className.replace(" hide", "");
        matrix.className += " hide";
    }
    else{
        ele.src = "img/icons/levels.png";
        matrix.className = levels.className.replace(" hide", "");
        levels.className += " hide";
    }
}

function trackUpdate(trackName){
    song[trackName].scale = jQuery.extend(true, {}, scale); // make a deep copy of the scale
    song[trackName].instrument = choice;
    
    var trackIndex = parseInt(trackName.replace("track", ""));
    MIDI.programChange(trackIndex, instruments.indexOf(song[trackName].instrument));
    messageOff();
	if (song[trackName].instrument != "gunshot"){
		document.getElementById(trackName + "-Title").innerHTML = toTitleCase(replaceAll("_", " ", song[trackName].instrument));
	}
	else{
		document.getElementById(trackName + "-Title").innerHTML = "Drum Kit";
	}
	IntervalManager.clearAll();
}

function saveSong(){
    if (document.cookie != "" && loginCookie.uName != "" ){
        messageOn("<p>Saving in progress...</p>", "messageOff()", false, "Ok");
        $.post("services/saveSong.php", {name:loginCookie.uName, sessionID:loginCookie.sessionID, data: JSON.stringify(song.metaData)}, function(data){
            console.log(data);
            var returnData = JSON.parse(data);
            song.metaData.songID = parseInt(returnData.songID);
            
            trackSave(0);
        });
    }
    else {
        messageOn("<p>You need to log in before you can save</p><p>Login now or create a new account.</p><iframe src=\"newAccount.html\" class=\"iframe\" scrolling=\"no\"></iframe>");
    }
}

//var tempStorage;
function publishSong(){
    if (document.cookie != "" && loginCookie.uName != "" && song.metaData.songID != ""){
        messageOn("<p>Publishing in progress...</p>", "messageOff()", false, "Ok");
        $.post("services/publishSong.php", {name:loginCookie.uName, sessionID:loginCookie.sessionID, data: JSON.stringify(song.metaData)}, function(data){
            //console.log(data);
            var returnData = JSON.parse(data);
            if (returnData.success){
                trackSave(0);
            }
            else{
                messageOn(returnData.error);
            }
        });
    }
    else {
        messageOn("<p>You cant publish an unsaved song. Please save your song fist</p>");
    }
}

function trackSave(trackNumber){
    if (trackNumber >= 16){
        //messageOn("<p>Save complete.</p>");
        for (var i = 0; i < deletedTracks.length; i++) {
            $.post("services/delTrack.php", {name:loginCookie.uName, sessionID:loginCookie.sessionID, songID: song.metaData.songID, trackID: deletedTracks[i]}, function(data){
                console.log(data);
            });
        };
        quoteSave(0);
        return;
    }
    if (song["track" + trackNumber].songData.length == 0){
        trackSave(trackNumber+1);
    }
    else{
        $.post("services/saveTrack.php", {name:loginCookie.uName, sessionID:loginCookie.sessionID, songID: song.metaData.songID, data:JSON.stringify(song["track" + trackNumber])}, function (data){
           console.log(data); 
           
           var returnData = JSON.parse(data);
           song["track" + trackNumber].id=parseInt(returnData.trackID);
           if (song["track" + trackNumber].id == NaN){
               location.reload();
           }
           trackSave(trackNumber+1);
        });
    }
}

function quoteSave(quoteNumber){
    if (quoteNumber == combos.length){
        messageOn("<p>Save complete.</p>");
        return;
    }
    $.post("services/quoteSave.php", {name:loginCookie.uName, sessionID:loginCookie.sessionID, songID: song.metaData.songID, data:JSON.stringify(combos[quoteNumber])}, function (data){
        //console.log(data);
        var dataStorage = JSON.parse(data);
        combos[quoteNumber].id=dataStorage.quoteID;
        quoteSave(quoteNumber + 1);
    });
}

phraseCreate = false;
function comboToggle(){
	$('img[src="img/icons/grid.png"]').click();
	if (phraseCreate){
		$(".matrixBox:not(.hide)").selectable("destroy");
		$(".ui-selected").removeClass("ui-selected");
		$(".trackTools").removeClass("quoteMode");
		quoteCombo = -1;
		$(".comboTrial").removeClass("comboTrial");
		$(".controllUL").addClass("hide");
	}
	else{
		$(".matrixBox:not(.hide)").selectable();
		$(".trackTools").addClass("quoteMode");
		$(".controllUL").removeClass("hide");
	}
	phraseCreate = !phraseCreate;
}

function createCombo(){
	//var highlighted = $(".ui-selected");
	if (!phraseCreate){
		messageOn('<p>You must be in Quote mode to use this function.</p><p>To enter quote mode click on the <img src="img/icons/quote.png" width="48" height="48" alt="Enter/Exit quote mode button" onclick="comboToggle(); messageOff();" title="Toggle quote mode" style="display:inline;cursor:hand;cursor:pointer"> button</p><p>If you are already in quote mode, please make a selection first</p>');
		
		$(".quoteUseOptions").remove();
		
		return;
	}
	var paturnHighlighted = $(".ui-selected[style]").sort(function (a,b){
		var noteAData = JSON.parse(a.id);
		var noteBData = JSON.parse(b.id);
		
		if (noteAData.collum < noteBData.collum){
			return -1;
		}
		if (noteAData.collum > noteBData.collum){
			return 1;
		}
		if (noteAData.collum == noteBData.collum){
			if (noteAData.tone < noteBData.tone){
				return -1;
			}
			if (noteAData.tone > noteBData.tone){
				return 1;
			}
		}
		return 0;
	});
	
	if (paturnHighlighted.length == 0){
		messageOn("<p>Please make a selection first by clicking and dragging to select some notes below.</p>");
		return;
	}
	// get the name of the combo
	
	// create combo object
	var startingData = JSON.parse( paturnHighlighted[0].id );
	var combo = jQuery.extend(true, {}, comboTemplate);
	//var startingCol = startingData.collum;
	//var startingTone = startingData.tone;
	for (var i = 0; i < paturnHighlighted.length; i++){
		currentNoteData = JSON.parse( paturnHighlighted[i].id );
		var comboNote = {"toneOffset": currentNoteData.tone-startingData.tone, "collumOffset": currentNoteData.collum - startingData.collum};
		combo.noteDeltas.push(comboNote);
	}
	
	for (var i = 0; i < combos.length; i++){
		if (combos[i].inUse && deepCompare( combos[i].noteDeltas,combo.noteDeltas)){
			messageOn("<p>This selection is the same as the selection <strong>" + combos[i].comboName + "</strong>. You sould use that one instead of making a new one.</p>");
			return;
		}
	}
	combo.comboName = askForComboName();
	if (combo.comboName === null){
		return;
	}
	
	combos.push(combo);
	comboListToggle();
	comboListToggle();
}

function askForComboName(){
	var name = prompt("Please enter the name name of this quote, It cannot be empty:", "");
	
	if (name !== ""){
		return name;
	}
	else{
		return askForComboName();
	}
}

function deepCompare () { // from: http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
  var i, l, leftChain, rightChain;

  function compare2Objects (x, y) {
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
         return true;
    }

    // Compare primitives and functions.     
    // Check if both arguments link to the same object.
    // Especially useful on step when comparing prototypes
    if (x === y) {
        return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
       (x instanceof Date && y instanceof Date) ||
       (x instanceof RegExp && y instanceof RegExp) ||
       (x instanceof String && y instanceof String) ||
       (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    // At last checking prototypes as good a we can
    if (!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
    }

    if (x.constructor !== y.constructor) {
        return false;
    }

    if (x.prototype !== y.prototype) {
        return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
         return false;
    }

    // Quick checking of one object beeing a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }
    }

    for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }

        switch (typeof (x[p])) {
            case 'object':
            case 'function':

                leftChain.push(x);
                rightChain.push(y);

                if (!compare2Objects (x[p], y[p])) {
                    return false;
                }

                leftChain.pop();
                rightChain.pop();
                break;

            default:
                if (x[p] !== y[p]) {
                    return false;
                }
                break;
        }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {

      leftChain = []; //Todo: this can be cached
      rightChain = [];

      if (!compare2Objects(arguments[0], arguments[i])) {
          return false;
      }
  }

  return true;
}

function comboListToggle(){
	if ($(".quoteUseOptions").length == 0){
		listButton = $(".controllUL");
		
		// get the list of quotes you have already made
		for (var i = 0; i < combos.length; i++){
			if (combos[i].inUse){
				var quoteLi = document.createElement("Li");
				quoteLi.innerHTML = combos[i].comboName;
				quoteLi.className = "quoteUseOptions";
				listButton.append(quoteLi);
				
				quoteLi.innerHTML += '<button onclick="useCombo(this, ' + i + ')">Toggle Use</button>';
				quoteLi.innerHTML += '<button onclick="renameCombo(' + i + ')">Rename</button>';
				quoteLi.innerHTML +='<button onclick="delCombo(' + i + ')">Delete</button>';
			}
		}
		
		// make the li to host the button to make quotes
		var quoteButtonLi = document.createElement("Li");
		listButton.append(quoteButtonLi);
		quoteButtonLi.className = "quoteUseOptions";
		
		var makeQuoteButton = document.createElement("button");
		makeQuoteButton.innerHTML="Create quote from current selection"
		makeQuoteButton.setAttribute("onclick","createCombo()");
		makeQuoteButton.setAttribute("style", "display: block;");
		quoteButtonLi.appendChild(makeQuoteButton);
	}
	else{
		$(".quoteUseOptions").remove();
	}
}

var quoteCombo = -1;
function useCombo(ele, comboIndex){
    if (!phraseCreate){
		messageOn('<p>You must be in Quote mode to use this function.</p><p>To enter quote mode click on the <img src="img/icons/quote.png" width="48" height="48" alt="Enter/Exit quote mode button" onclick="comboToggle(); messageOff();" title="Toggle quote mode" style="display:inline;cursor:hand;cursor:pointer"> button</p>');
		
		$(".quoteUseOptions").remove();
		
		return;
	}
    
	//quoteCombo = comboIndex;
	//comboListToggle();
	if (quoteCombo == -1){
		quoteCombo = comboIndex;
		comboListToggle();
	}
	else{
		quoteCombo = -1;
		comboListToggle();
		$(".comboTrial").removeClass("comboTrial");
	}
}

function delCombo(comboIndex){
	combos[comboIndex].inUse = false;
	
	comboListToggle();
	comboListToggle();
}

function renameCombo(comboIndex){
	combos[comboIndex].comboName = askForComboName();
	
	comboListToggle();
	comboListToggle();
}

function songLengthDialogue(){
	var info = "";
	
	info += "<p>Your song \"" + song.metaData.name + "\" had <strong id='totalNotesCur'>" + song.metaData.nps*song.metaData.length + "</strong> collums of notes of track space playing at a maximum of <strong>" + song.metaData.nps + " notes per second.</strong> for <strong>" + Math.floor(song.metaData.length/60) + " minutes and " + song.metaData.length%60 + " second</strong>.";
	
	info += '<p>You can change your song to play at <input id="newNPS" type="number" class="scaleInput" value="' + song.metaData.nps + '"  min="2" max="32" onchange="recalcLength()" style="float:none;"> notes per seconds max for <input id="newDurationMin" type="number" class="scaleInput" value="' + Math.floor(song.metaData.length/60) + '" min="0" style="float:none;" onchange="updatePrediction()"> minutes and <input id="newDurationSec" type="number" class="scaleInput" value="' + song.metaData.length%60 + '"  min="0" style="float:none;" onchange="updatePrediction()"> seconds.</p>';
	
	info += '<p>This will result in your song "' + song.metaData.name + '" to have a total of <strong id="predictedWorkspace">' + song.metaData.nps*song.metaData.length + '</strong> collums of notes to work with.</p>'; 
	
	messageOn(info, "trackRetime()", true, "Change");
}

function updatePrediction(){
	var newNPS = parseInt(document.getElementById("newNPS").value);
	var newDurationSec = parseInt(document.getElementById("newDurationMin").value)*60 + parseInt(document.getElementById("newDurationSec").value);
	
	document.getElementById("predictedWorkspace").innerHTML = newNPS*newDurationSec;
}

function recalcLength(){
	console.log("recalcing");
	var newNPS = parseInt(document.getElementById("newNPS").value);
	var newDurationMin = document.getElementById("newDurationMin").value;
	var newDurationSec = document.getElementById("newDurationSec").value;
	
	var newTotalDurationSec = (song.metaData.nps*song.metaData.length)/newNPS;
	document.getElementById("newDurationMin").value = Math.floor(newTotalDurationSec/60);
	document.getElementById("newDurationSec").value = Math.ceil(newTotalDurationSec%60);
	
	updatePrediction();
}

function exportSong(){
    //messageOn("<p>This function is currently under construction</p>");
    messageOn("Please choose how you would like to export your song: <br> <button type='button' onclick='jsonExport()'>JSON exporter</button><br> <button type='button' onclick='midiExport(1)'>Multi Track MIDI Exporter</button> <br> <button type='button' onclick='midiExport(0)'>Mono Track MIDI Exporter</button> <br> <button type='button' onclick='publishSong()'>Publish For Public Viewing</button>", "messageOff()", true, "Maybe Later");
}

function jsonExport(){
    var blob = new Blob([JSON.stringify(song)],{type: "text/plain;charset=utf-8"});
    saveAs(blob, song.metaData.name + ".json");
}

var beatScale = 64;
function midiExport(type){
    // create container for xmlMidi 
    /*var songBody = $("#songBody");
    var xmlMidi = document.createElement("div");
    xmlMidi.id = "xmlMidi";
    $("#songBody").append(xmlMidi);*/
    
    if (type === undefined){
        type = 1;
    }
    
    //xmlMidi.innerHTML = '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE MIDIFile SYSTEM "http://www.musicxml.org/dtds/midixml.dtd"><MIDIFile></MIDIFile>';
    var midiXMLStr = '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE MIDIFile SYSTEM "http://www.musicxml.org/dtds/midixml.dtd"><MIDIFile>';
    
    // adding the format
    var format = document.createElement("Format");
    format.innerHTML = type;
    //$("midifile").append(format);
    midiXMLStr += document.getHTML(format, true);
    
    // find out how many tracks has things in it
    var usedTracks = 0;
    for (var i = 0; i <= 15; i++){
        if (song["track" + i].songData.length > 0){
            usedTracks++;
        }
    }
    
    // add trackCount
    var TCount = document.createElement("TrackCount");
    TCount.innerHTML = usedTracks;
    //$("midifile").append(TCount);
    midiXMLStr += document.getHTML(TCount, true);
    
    // add tempo
    var TPB = document.createElement("TicksPerBeat");
    TPB.innerHTML = (nps/2)*beatScale;
    //$("midifile").append(TPB);
    midiXMLStr += document.getHTML(TPB, true);
    
    var TST = document.createElement("TimestampType");
    TST.innerHTML = "Absolute";
    $("midifile").append(TST);
    midiXMLStr += document.getHTML(TST, true);
    
    var gunTrack = -1;
    for (var i = 0; i < usedTracks; i++){ // track level for loop
        
        //add track parameter
        //var t = document.createElement("Track");
        //t.setAttribute("Number", (i+1).toString());
        //$("midifile").append(t);
        midiXMLStr += '<track number="' + (i+1).toString() + '">';
        
        
        //console.log(i);
        
        //create change track number element
        var e = document.createElement("Event");
        var a = document.createElement("Absolute");
        a.innerHTML = 0;
        e.appendChild(a);
        var shotsFired = false;
        if (instruments.indexOf(song["track" + i].instrument) == 127){
            //var PC = document.createElement("programChange");
            //PC.setAttribute("Channel", (i+1).toString());
            //PC.setAttribute("Number", (instruments.indexOf(song["track" + i].instrument)+1).toString());
            //e.appendChild(PC);
            shotsFired = true;
            gunTrack = i;
        }
        else{
            var PC = document.createElement("programChange");
            PC.setAttribute("Channel", (i+1).toString());
            PC.setAttribute("Number", (instruments.indexOf(song["track" + i].instrument)).toString());
            e.appendChild(PC);
            if (i == 9 ){
                PC.setAttribute("Channel", gunTrack);
            }
        }
        //console.log(document.getHTML(e, true));
        midiXMLStr += document.getHTML(e, true);
        
        // get song data and dupm it into the track
        for (var j = 1; j <= song["track" + i].songData.length; j++ ){// collum level for loop
            if ( j < song["track" + i].songData.length){
                if (song["track" + i].songData[j][0].vol > -0.5){// if there is a change in volume
                    song["track" + i].lastVolKey = song["track" + i].songData[j][0].vol;
                }
                if (shotsFired){
                    for (var k = 1; k < song["track" + i].songData[j].length; k++){// note level for loop @ turn on note
                        if (song["track" + i].songData[j-1].indexOf(song["track" + i].songData[j][k]) == -1 ){ // there is no data for this note in the previous set
                            // create midi event
                            var midiEvent = document.createElement("Event");
                            // specify event time
                            var abs = document.createElement("Absolute");
                            abs.innerHTML = (j-1)*beatScale;
                            midiEvent.appendChild(abs);
                            // specify event note
                            var noteOnEvent = document.createElement("NoteOn");
                            noteOnEvent.setAttribute("Channel", "10"); // if we are in the precussive set we should be using that track
                            noteOnEvent.setAttribute("Note", midiNoteAt(i, j, k) );
                            //console.log(song["track" + i].lastVolKey);
                            noteOnEvent.setAttribute("Velocity", Math.floor(127*song["track" + i].lastVolKey));
                            midiEvent.appendChild(noteOnEvent);
                            midiXMLStr += document.getHTML(midiEvent, true);
                            //t.appendChild(midiEvent);
                        }
                        
                    }
                    for (var k = 1; k < song["track" + i].songData[j-1].length; k++){// note level for loop @ turn off note
                        if (song["track" + i].songData[j].indexOf(song["track" + i].songData[j-1][k]) == -1 ){ // there is no data for the previous note in this set
                            // create midi event
                            var midiEvent = document.createElement("Event");
                            // specify event time
                            var abs = document.createElement("Absolute");
                            abs.innerHTML = (j-1)*beatScale;
                            midiEvent.appendChild(abs);
                            // specify event note
                            var noteOnEvent = document.createElement("NoteOff");
                            noteOnEvent.setAttribute("Channel", "10"); // if we are in the precussive set we should be using that track
                            noteOnEvent.setAttribute("Note", midiNoteAt(i, j-1, k) );
                            noteOnEvent.setAttribute("Velocity", "0");
                            midiEvent.appendChild(noteOnEvent);
                            midiXMLStr += document.getHTML(midiEvent, true);
                            //t.appendChild(midiEvent);
                        }
                    }
                }
                else{
                   for (var k = 1; k < song["track" + i].songData[j].length; k++){// note level for loop @ turn on note
                        if (song["track" + i].songData[j-1].indexOf(song["track" + i].songData[j][k]) == -1 ){ // there is no data for this note in the previous set
                            // create midi event
                            var midiEvent = document.createElement("Event");
                            // specify event time
                            var abs = document.createElement("Absolute");
                            abs.innerHTML = (j-1)*beatScale;
                            midiEvent.appendChild(abs);
                            // specify event note
                            var noteOnEvent = document.createElement("NoteOn");
                            noteOnEvent.setAttribute("Channel", (i+1).toString()); // if we are in the precussive set we should be using that track
                            noteOnEvent.setAttribute("Note", midiNoteAt(i, j, k) );
                            noteOnEvent.setAttribute("Velocity", Math.floor(127*song["track" + i].lastVolKey));
                            midiEvent.appendChild(noteOnEvent);
                            midiXMLStr += document.getHTML(midiEvent, true);
                            //t.appendChild(midiEvent);
                        }
                        
                    }
                    for (var k = 1; k < song["track" + i].songData[j-1].length; k++){// note level for loop @ turn off note
                        if (song["track" + i].songData[j].indexOf(song["track" + i].songData[j-1][k]) == -1 ){ // there is no data for the previous note in this set
                            // create midi event
                            var midiEvent = document.createElement("Event");
                            // specify event time
                            var abs = document.createElement("Absolute");
                            abs.innerHTML = (j-1)*beatScale;
                            midiEvent.appendChild(abs);
                            // specify event note
                            var noteOnEvent = document.createElement("NoteOff");
                            noteOnEvent.setAttribute("Channel", (i+1).toString()); // if we are in the precussive set we should be using that track
                            //console.log('song["track"+' + i + '].scale[song["track" + ' + i + '].songData[' + j + '][' + k + ']]');
                            noteOnEvent.setAttribute("Note", midiNoteAt(i, j-1, k) );
                            noteOnEvent.setAttribute("Velocity", "0");
                            midiEvent.appendChild(noteOnEvent);
                            midiXMLStr += document.getHTML(midiEvent, true);
                            //t.appendChild(midiEvent);
                        }
                    } 
                }
            }
            else{
                if (shotsFired){
                    for (var k = 1; k < song["track" + i].songData[j-1].length; k++){// note level for loop @ turn off note
                        // create midi event
                        var midiEvent = document.createElement("Event");
                        // specify event time
                        var abs = document.createElement("Absolute");
                        abs.innerHTML = (j-1)*beatScale;
                        midiEvent.appendChild(abs);
                        // specify event note
                        var noteOnEvent = document.createElement("NoteOff");
                        noteOnEvent.setAttribute("Channel", "10"); // if we are in the precussive set we should be using that track
                        noteOnEvent.setAttribute("Note", midiNoteAt(i, j-1, k));
                        noteOnEvent.setAttribute("Velocity", "0");
                        midiEvent.appendChild(noteOnEvent);
                        midiXMLStr += document.getHTML(midiEvent, true);
                    }
                }
                else{
                    for (var k = 1; k < song["track" + i].songData[j-1].length; k++){// note level for loop @ turn off note
                        // create midi event
                        var midiEvent = document.createElement("Event");
                        // specify event time
                        var abs = document.createElement("Absolute");
                        abs.innerHTML = (j-1)*beatScale;
                        midiEvent.appendChild(abs);
                        // specify event note
                        var noteOnEvent = document.createElement("NoteOff");
                        noteOnEvent.setAttribute("Channel", (i+1).toString()); // if we are in the precussive set we should be using that track
                        //console.log('song["track"+' + i + '].scale[song["track" + ' + i + '].songData[' + j + '][' + k + ']]');
                        noteOnEvent.setAttribute("Note", midiNoteAt(i, j-1, k) );
                        noteOnEvent.setAttribute("Velocity", "0");
                        midiEvent.appendChild(noteOnEvent);
                        midiXMLStr += document.getHTML(midiEvent, true);
                    }
                }
            }
        }
        song["track" + i].lastVolKey = 0.5;
        //$("midifile")[0].innerHTML += "</track>";
        midiXMLStr += "</track>";
        //console.log(i);
    }
    midiXMLStr += "</MIDIFile>";
    
    replaceAll("format" , "Format" , midiXMLStr);
    replaceAll("trackcount" , "TrackCount" , midiXMLStr);
    replaceAll("ticksperbeat" , "TicksPerBeat" , midiXMLStr);
    replaceAll("timestamptype" , "TimestampType" , midiXMLStr);
    replaceAll("track" , "Track" , midiXMLStr);
    replaceAll("event" , "Event" , midiXMLStr);
    replaceAll("programChange" , "ProgramChange" , midiXMLStr);
    replaceAll("absolute" , "Absolute" , midiXMLStr);
    replaceAll("noteon" , "NoteOn" , midiXMLStr);
    replaceAll("channel" , "Channel" , midiXMLStr);
    replaceAll("note" , "Note" , midiXMLStr);
    replaceAll("velocity" , "Velocity" , midiXMLStr);
    
    //console.log(midiXMLStr)
    
    $.post("phpMidi/midi_class_v178/xml2midiService.php", {txt: midiXMLStr}, function(data){
        //do somethin with data
        //console.log(data);
        
        messageOn(data);
    })
}

var playerMidiData;
function serverPlayerExport(type){
    // create container for xmlMidi 
    /*var songBody = $("#songBody");
    var xmlMidi = document.createElement("div");
    xmlMidi.id = "xmlMidi";
    $("#songBody").append(xmlMidi);*/
    
    if (type === undefined){
        type = 1;
    }
    
    //xmlMidi.innerHTML = '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE MIDIFile SYSTEM "http://www.musicxml.org/dtds/midixml.dtd"><MIDIFile></MIDIFile>';
    var midiXMLStr = '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE MIDIFile SYSTEM "http://www.musicxml.org/dtds/midixml.dtd"><MIDIFile>';
    
    // adding the format
    var format = document.createElement("Format");
    format.innerHTML = type;
    //$("midifile").append(format);
    midiXMLStr += document.getHTML(format, true);
    
    // find out how many tracks has things in it
    var usedTracks = 0;
    for (var i = 0; i <= 15; i++){
        if (song["track" + i].songData.length > 0){
            usedTracks++;
        }
    }
    
    // add trackCount
    var TCount = document.createElement("TrackCount");
    TCount.innerHTML = usedTracks;
    //$("midifile").append(TCount);
    midiXMLStr += document.getHTML(TCount, true);
    
    // add tempo
    var TPB = document.createElement("TicksPerBeat");
    TPB.innerHTML = (nps/2)*beatScale;
    //$("midifile").append(TPB);
    midiXMLStr += document.getHTML(TPB, true);
    
    var TST = document.createElement("TimestampType");
    TST.innerHTML = "Absolute";
    $("midifile").append(TST);
    midiXMLStr += document.getHTML(TST, true);
    
    var gunTrack = -1;
    for (var i = 0; i < usedTracks; i++){ // track level for loop
        
        //add track parameter
        //var t = document.createElement("Track");
        //t.setAttribute("Number", (i+1).toString());
        //$("midifile").append(t);
        midiXMLStr += '<track number="' + (i+1).toString() + '">';
        
        
        //console.log(i);
        
        //create change track number element
        var e = document.createElement("Event");
        var a = document.createElement("Absolute");
        a.innerHTML = 0;
        e.appendChild(a);
        var shotsFired = false;
        /*if (instruments.indexOf(song["track" + i].instrument) == 127){
            //var PC = document.createElement("programChange");
            //PC.setAttribute("Channel", (i+1).toString());
            //PC.setAttribute("Number", (instruments.indexOf(song["track" + i].instrument)+1).toString());
            //e.appendChild(PC);
            shotsFired = true;
            gunTrack = i;
        }
        else{*/
            var PC = document.createElement("programChange");
            PC.setAttribute("Channel", (i+1).toString());
            PC.setAttribute("Number", (instruments.indexOf(song["track" + i].instrument)).toString());
            e.appendChild(PC);
            //if (i == 9 ){
                //PC.setAttribute("Channel", gunTrack);
            //}
        //}
        //console.log(document.getHTML(e, true));
        midiXMLStr += document.getHTML(e, true);
        
        // get song data and dupm it into the track
        for (var j = 1; j <= song["track" + i].songData.length; j++ ){// collum level for loop
            if ( j < song["track" + i].songData.length){
                if (song["track" + i].songData[j][0].vol > -0.5){// if there is a change in volume
                    song["track" + i].lastVolKey = song["track" + i].songData[j][0].vol;
                }
                if (shotsFired){
                    for (var k = 1; k < song["track" + i].songData[j].length; k++){// note level for loop @ turn on note
                        if (song["track" + i].songData[j-1].indexOf(song["track" + i].songData[j][k]) == -1 ){ // there is no data for this note in the previous set
                            // create midi event
                            var midiEvent = document.createElement("Event");
                            // specify event time
                            var abs = document.createElement("Absolute");
                            abs.innerHTML = (j-1)*beatScale;
                            midiEvent.appendChild(abs);
                            // specify event note
                            var noteOnEvent = document.createElement("NoteOn");
                            noteOnEvent.setAttribute("Channel", "10"); // if we are in the precussive set we should be using that track
                            noteOnEvent.setAttribute("Note", midiNoteAt(i, j, k) );
                            //console.log(song["track" + i].lastVolKey);
                            noteOnEvent.setAttribute("Velocity", Math.floor(127*song["track" + i].lastVolKey));
                            midiEvent.appendChild(noteOnEvent);
                            midiXMLStr += document.getHTML(midiEvent, true);
                            //t.appendChild(midiEvent);
                        }
                        
                    }
                    for (var k = 1; k < song["track" + i].songData[j-1].length; k++){// note level for loop @ turn off note
                        if (song["track" + i].songData[j].indexOf(song["track" + i].songData[j-1][k]) == -1 ){ // there is no data for the previous note in this set
                            // create midi event
                            var midiEvent = document.createElement("Event");
                            // specify event time
                            var abs = document.createElement("Absolute");
                            abs.innerHTML = (j-1)*beatScale;
                            midiEvent.appendChild(abs);
                            // specify event note
                            var noteOnEvent = document.createElement("NoteOff");
                            noteOnEvent.setAttribute("Channel", "10"); // if we are in the precussive set we should be using that track
                            noteOnEvent.setAttribute("Note", midiNoteAt(i, j-1, k) );
                            noteOnEvent.setAttribute("Velocity", "0");
                            midiEvent.appendChild(noteOnEvent);
                            midiXMLStr += document.getHTML(midiEvent, true);
                            //t.appendChild(midiEvent);
                        }
                    }
                }
                else{
                   for (var k = 1; k < song["track" + i].songData[j].length; k++){// note level for loop @ turn on note
                        if (song["track" + i].songData[j-1].indexOf(song["track" + i].songData[j][k]) == -1 ){ // there is no data for this note in the previous set
                            // create midi event
                            var midiEvent = document.createElement("Event");
                            // specify event time
                            var abs = document.createElement("Absolute");
                            abs.innerHTML = (j-1)*beatScale;
                            midiEvent.appendChild(abs);
                            // specify event note
                            var noteOnEvent = document.createElement("NoteOn");
                            noteOnEvent.setAttribute("Channel", (i+1).toString()); // if we are in the precussive set we should be using that track
                            noteOnEvent.setAttribute("Note", midiNoteAt(i, j, k) );
                            noteOnEvent.setAttribute("Velocity", Math.floor(127*song["track" + i].lastVolKey));
                            midiEvent.appendChild(noteOnEvent);
                            midiXMLStr += document.getHTML(midiEvent, true);
                            //t.appendChild(midiEvent);
                        }
                        
                    }
                    for (var k = 1; k < song["track" + i].songData[j-1].length; k++){// note level for loop @ turn off note
                        if (song["track" + i].songData[j].indexOf(song["track" + i].songData[j-1][k]) == -1 ){ // there is no data for the previous note in this set
                            // create midi event
                            var midiEvent = document.createElement("Event");
                            // specify event time
                            var abs = document.createElement("Absolute");
                            abs.innerHTML = (j-1)*beatScale;
                            midiEvent.appendChild(abs);
                            // specify event note
                            var noteOnEvent = document.createElement("NoteOff");
                            noteOnEvent.setAttribute("Channel", (i+1).toString()); // if we are in the precussive set we should be using that track
                            //console.log('song["track"+' + i + '].scale[song["track" + ' + i + '].songData[' + j + '][' + k + ']]');
                            noteOnEvent.setAttribute("Note", midiNoteAt(i, j-1, k) );
                            noteOnEvent.setAttribute("Velocity", "0");
                            midiEvent.appendChild(noteOnEvent);
                            midiXMLStr += document.getHTML(midiEvent, true);
                            //t.appendChild(midiEvent);
                        }
                    } 
                }
            }
            else{
                if (shotsFired){
                    for (var k = 1; k < song["track" + i].songData[j-1].length; k++){// note level for loop @ turn off note
                        // create midi event
                        var midiEvent = document.createElement("Event");
                        // specify event time
                        var abs = document.createElement("Absolute");
                        abs.innerHTML = (j-1)*beatScale;
                        midiEvent.appendChild(abs);
                        // specify event note
                        var noteOnEvent = document.createElement("NoteOff");
                        noteOnEvent.setAttribute("Channel", "10"); // if we are in the precussive set we should be using that track
                        noteOnEvent.setAttribute("Note", midiNoteAt(i, j-1, k));
                        noteOnEvent.setAttribute("Velocity", "0");
                        midiEvent.appendChild(noteOnEvent);
                        midiXMLStr += document.getHTML(midiEvent, true);
                    }
                }
                else{
                    for (var k = 1; k < song["track" + i].songData[j-1].length; k++){// note level for loop @ turn off note
                        // create midi event
                        var midiEvent = document.createElement("Event");
                        // specify event time
                        var abs = document.createElement("Absolute");
                        abs.innerHTML = (j-1)*beatScale;
                        midiEvent.appendChild(abs);
                        // specify event note
                        var noteOnEvent = document.createElement("NoteOff");
                        noteOnEvent.setAttribute("Channel", (i+1).toString()); // if we are in the precussive set we should be using that track
                        //console.log('song["track"+' + i + '].scale[song["track" + ' + i + '].songData[' + j + '][' + k + ']]');
                        noteOnEvent.setAttribute("Note", midiNoteAt(i, j-1, k) );
                        noteOnEvent.setAttribute("Velocity", "0");
                        midiEvent.appendChild(noteOnEvent);
                        midiXMLStr += document.getHTML(midiEvent, true);
                    }
                }
            }
        }
        song["track" + i].lastVolKey = 0.5;
        //$("midifile")[0].innerHTML += "</track>";
        midiXMLStr += "</track>";
        //console.log(i);
    }
    midiXMLStr += "</MIDIFile>";
    
    replaceAll("format" , "Format" , midiXMLStr);
    replaceAll("trackcount" , "TrackCount" , midiXMLStr);
    replaceAll("ticksperbeat" , "TicksPerBeat" , midiXMLStr);
    replaceAll("timestamptype" , "TimestampType" , midiXMLStr);
    replaceAll("track" , "Track" , midiXMLStr);
    replaceAll("event" , "Event" , midiXMLStr);
    replaceAll("programChange" , "ProgramChange" , midiXMLStr);
    replaceAll("absolute" , "Absolute" , midiXMLStr);
    replaceAll("noteon" , "NoteOn" , midiXMLStr);
    replaceAll("channel" , "Channel" , midiXMLStr);
    replaceAll("note" , "Note" , midiXMLStr);
    replaceAll("velocity" , "Velocity" , midiXMLStr);
    
    //console.log(midiXMLStr)
    
    $.post("phpMidi/midi_class_v178/xml2midiService.php", {txt: midiXMLStr}, function(data){
		
		playerMidiData = data;
		
		var tempDiv = document.createElement("div");
		tempDiv.innerHTML = playerMidiData;
		var serverMidiData = $(tempDiv).children()[0].href;
		
		MIDI.Player.loadFile(serverMidiData, function(){
			var fileLocation = serverMidiData.split("?")[1];
			$.get("phpMidi/midi_class_v178/removeUsed.php?f=tmp%2F20726.mid?"+fileLocation);
			
			loadedAndPlay();
		});
    })
}
/*
function loadedAndPlay(){
	MIDI.Player.currentTime = (currentTime-1.5)/song.metaData.nps*1000;
	
	MIDI.Player.start();
	timelineSlider = document.getElementById("timeLine");
	IntervalManager.set(0, timeUpdate, 1000/song.metaData.nps);
	
	messageOff();
}*/

function midiNoteAt(i, j, k){
    
    var midiNote =/* MIDI.keyToNote[noteToKey[*/ (song["track"+i].scale[song["track" + i].songData[j][k]]) /*]]*/;
    
    if (midiNote === undefined || isNaN(midiNote)){
        console.log([i, j, k]);
    }
    
    return midiNote;
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

document.getHTML= function(who, deep){
    if(!who || !who.tagName) return '';
    var txt, ax, el= document.createElement("div");
    el.appendChild(who.cloneNode(false));
    txt= el.innerHTML;
    if(deep){
        ax= txt.indexOf('>')+1;
        txt= txt.substring(0, ax)+who.innerHTML+ txt.substring(ax);
    }
    el= null;
    return txt;
}

function clearMidiXML(){
    $("#xmlMidi").remove();
}

function rewind(){
    var slider = document.getElementById("timeLine");
    slider.value = 0;
    sliderUpdate(slider);
	$("body").animate({scrollLeft: 0}, 2000);
}

// ---------------------------------------------------------------
// screen control
// ---------------------------------------------------------------

var scrollMode = "virt";
$(document).on("keydown", function (e) {
    if ((e.shiftKey || e.keyCode == 32) && mode == "initialized"){
        e.preventDefault();
        if (scrollMode == "virt"){
            scrollMode = "horiz";
            document.body.style.backgroundColor = "#E6E6E6";
        }
        else{
            scrollMode = "virt";
            document.body.style.backgroundColor = "#444444";
        }
    }
});

$(document).mousedown(function(event){
    //console.log(event);
    if (event.button != 1){
        dragging = true;
        
    }
});

$(document).mouseup(function(){
    dragging = false;
});

var scrollLeftDist = 0; 
$(function() { // horizontal scrolling provided by http://css-tricks.com/
   $("body").mousewheel(function(event, delta) {
        if (scrollMode == "horiz"){
    	    this.scrollLeft -= (delta * 30);
			scrollLeftDist = this.scrollLeft;
    	    event.preventDefault();
			//console.log(this.scrollLeft);
			if(this.scrollLeft > 35){
				$(".trackTools").css("left", this.scrollLeft-35);
				$(".trackTools").css("opacity", 0.7);
			}
			else{
				$(".trackTools").css("left", 0);
				$(".trackTools").css("opacity", 1);
			}
        }
        //console.log($( window ).scrollTop());
        setTimeout(function (){
            document.getElementById("timeLine").style.top = ($( window ).scrollTop() -32 ) + "px";
        }, 10);
   });
});

// ---------------------------------------------------------------
// miscalanious functions
// ---------------------------------------------------------------
 
function acknowledgements(){
    var displayText = "<h2>Special thanks to these wonderful programmers for making this possiable</h2>Mudcube: <a href='https://github.com/mudcube/MIDI.js'>Midi.JS</a><br>";
    displayText += "Gleitz: <a href='https://github.com/gleitz/midi-js-soundfonts'>Midi.JS SoundFonts</a><br>";
	displayText += "Sergi Mansilla: <a href='https://github.com/sergi/jsmidi'>jsmidi</a><br>";
	displayText += "Dingram: <a href='https://github.com/dingram/jsmidgen'>jsmidigen</a><br>";
    displayText += "Letoribo: <a href='https://github.com/letoribo/General-MIDI-Percussion-soundfonts-for-MIDI.js-'>General Midi Percussion SoundFonts</a><br>";
    displayText += "Eligrey: <a href='https://github.com/eligrey/FileSaver.js/'>FileSaver.js</a><br>";
    displayText += "Eligrey: <a href='https://github.com/eligrey/Blob.js'>Blobs.js</a><br>";
    displayText += "Valentin Schmidt: <a href='http://valentin.dasdeck.com/php/midi/'>PHP Midi</a><br>";
	displayText += "Sterling Isfine: <a href='http://www.webdeveloper.com/forum/showthread.php?233448-Is-there-a-way-to-find-if-any-intervals-are-still-open'>Interval Manager</a><br>";
	displayText += "Peter mortensen and Crazyx: <a href='http://stackoverflow.com/questions/1068834/object-comparison-in-javascript'>JSON object deep comparison </a><br>";
	displayText += "Buley and Tomwrong: <a href='http://stackoverflow.com/questions/1248302/javascript-object-size'>JSON object size estimater</a><br>";
    displayText += "JQuery Community: <a href='https://jquery.com/'>All of JQuery</a><br>";
    displayText += "Tonematrix Audiotool: <a href='http://tonematrix.audiotool.com/'>Inspiration</a><br><br>";
    
    displayText += "<p>Music Matrix Composer is created by Muggy Ate. Feel free to use this program for your own creative needs.</p>";
    
    messageOn(displayText);
}

function showTutorial(){
    var displayText = '<div style="width:' + Math.floor($( document ).width()*0.75) + 'px"><h2 class="sectionName">Tutorial:</h2><div class="aspect-ratio"><iframe width="560" height="315" src="https://www.youtube.com/embed/5sBw8lucG4k" frameborder="0" allowfullscreen></iframe></div></div>';
    messageOn(displayText);
    
}

function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

// ---------------------------------------------------------------
// generative music functions
// ---------------------------------------------------------------
    
function slideNote(note, amount){
    document.getElementById(note).value = (parseInt(document.getElementById(note).value) + amount);
    document.getElementById(note).onchange();
}

function transpose(amount){
    for (var i = 1; i <=16; i++){
        slideNote("T" + i, amount);
    }
    console.log(JSON.stringify(scale));
}

function clickNote(trackNumber, position, note){
    var target = '{"ParentTrack":"track' + trackNumber + '","tone":' + note + ',"collum":' + position + '}';
    var ele = document.getElementById(target);
    //console.log(target);
    if (ele != null){
        ele.click();
    }
}

function randomInt(min, max){
    return Math.floor((Math.random() * max) + min);
}

function generate(trackIndex){
    for(var i = 1; i < loop; i++){
        // 3 states: no note 2/5 chance, long note 2/5 chance, 1 note 1/5 chance;
        var decider = randomInt(1,5);
        //console.log(i, decider)
        if (decider == 2 || decider == 3){ // long note
            longNote(randomInt(0,6), trackIndex, i, randomInt(1,16));
        }
        if (decider == 3){ // single note
            clickNote(trackIndex, i, randomInt(1,16));
        }
        // 30% chance to add another note here
        if (randomInt(1,10) < 3){
            i--;
        }
    }
}

function longNote(duration, trackIndex, position, note){
    for (var i = 0; i < duration; i++){
        clickNote(trackIndex, position + i, note);
    }
}
