<!DOCTYPE html>
<?php
    function sanitize_output($buffer) {
    
        $search = array(
            '/\>[^\S ]+/s',  // strip whitespaces after tags, except space
            '/[^\S ]+\</s',  // strip whitespaces before tags, except space
            '/(\s)+/s'       // shorten multiple whitespace sequences
        );
    
        $replace = array(
            '>',
            '<',
            '\\1'
        );
    
        $buffer = preg_replace($search, $replace, $buffer);
    
        return $buffer;
    }
?>
<html>
    <head>
    <?php $noCache = time(); ?>
        <script>
            if (window.location.protocol != "https:"){
			    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
			}
        </script>
        <meta charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="CSS/index.css<?php echo "?noCache=$noCache"; ?>">
        <title>Music Matrix Composer v2</title>
    </head>
    
    <body onload="login()" style="background-color:#E6E6E6;">
        <div id="infoGroup" class="infoGroup" style="display:none">
            <div class="infoBG" id="alert" onclick="messageOff()"></div>
            <div class="infoBody" id="infoBody">
                <div id="messageBody"></div>
                <button id="confirm" type="button" class="alertOk" onclick="messageOff()">Ok</button>
            </div>
        </div>
        <div id="banner" >
            <h1>Music Matrix Composer v2</h1>
            <div id="login" class="login">
                <form action="#" method="post" onsubmit="return login('email', 'password')">
                    <input type="text" name="email" id="email" placeholder="Username">
                    <input type="password" name="password" id="password" placeholder="password">
                    <input type="submit" value="login">
                </form>
            </div>
            <div id="weba" class="login hide">
                <h7>welcome back senpai</h7>
                <input type="button" onclick="logout()" value="logout">
            </div>
        </div>
        <div id="mainbody">
            <div id="rightCollum" class="leftCollumBody">
                <div id="newSong" class="collumEle">
                    <h2 class="sectionName">New Song</h2>
                    <form action="#" method="post" onsubmit="return initializeSong()">
                        <div id="scale" onmouseup="scaleInfo()">Advanced Settings</div>
                        <lable for="songName">Song Name: </lable>
                        <input id="songName" name="songName" type="text" placeholder="Name of New Song" class="inputField"><br>
                        <lable for="songLength">Song Length: </lable>
                        <input id="songLength" type="number" name="min" placeholder="minutes" min="0" max="59"class="numberSelect inputField">
                        <input id="songSec" type="number" name="seconds" placeholder="seconds" min="0" max="59" class="numberSelect inputField "><br>
                        <label for="NPS">Notes per Second: </label>
                        <input id="NPS" type="number" name="NPS" placeholder="BPM/60" class="numberSelect inputField" value="8" min="1" max="32" onchange="bpsUpdate()"><br>
                        <input type="submit" value="create" class="inputField">
                    </form>
                </div>
                <div id="newUser" class="collumEle">
                    <form action="#banner" method="post" onsubmit="return registerAcc()">
                        <h2 class="sectionName">New Account</h2>
                        <label for="desiredName">Desired Username: </label>
                        <input type="text" name="desiredName" id="desiredName" placeholder="Desired username" class="inputField"><br>
                        <lable for="pass1">New Password: </lable>
                        <input type="password" name="pass1" id="pass1" placeholder="Password" class="inputField" required><br>
                        <lable for="pass2">Re-enter Password: </lable>
                        <input type="password" name="pass2" id="pass2" placeholder="Re-type password" class="inputField" required><br>
                        <input type="submit" name="register" value="register" class="inputField">
                    </form>
                </div>
                <div id="returningUser" class="collumEle hide">
                    <h2 class="sectionName">Your saved songs:</h2>
                </div>
                <div id="credits" class="collumEle">
                    <h2>Special thanks to:</h2>
                    <button class="alertOk" onclick="acknowledgements();" style="float:none; width:auto;">Acknowledgements</button>
                </div>
            </div>
            <div id="leftCollum" class="rightCollumBody">
                <div class="collumEle strech">
                    <h2 class="sectionName">
                        Under construction
                    </h2>
                    <p>
                        There are some more features that would be happening in this space but will be added at a later date...
                    </p>
                    <p>
                        If you are on a mobile browser, please make sure you're using the latest version of chrome as that would show the most amount of results. Hoever even if this site works on chrome for mobile, there will be various other bugs and playback issues. Remember to export your song as a Midi file every so often to hear it at full quality if you are working from a mobile device. 
                </div>
            </div>
            <div class="floatClear"></div>
        </div>
        <div id="songBody" class="hide">
            <div id="buttonHolder" class="controllBar">
                <img src="img/icons/Play.png" width="48" height="48" alt="play Button" class="controllButtons" onclick="playSong(this)" title="Play/Pause">
                <img src="img/icons/Rewind.png" width="48" height="48" alt="Rewind to Start Button" class="controllButtons" onclick="rewind()" title="Rewind to Start">
                <img src="img/icons/Save.png" width="48" height="48" alt="save Button" class="controllButtons" onclick="saveSong()" title="Save Song (login required)">
                <div class="controllButtons" id="loopButton" onclick="looper()" title="Looper Tool (right click to use when active)">
                    <img src="img/icons/Looper.png" width="48" height="48" alt="looper Button">
                    <p id="looperNumber">16</p>
                    <img src="img/icons/clear.png" id="looperCover" width="48" height="48" alt="looper Button Cover">
                </div>
                <img src="img/icons/+.png" width="48" height="48" alt="New track button" class="controllButtons" onclick="addTrack()" title="New Track (max 16)"><img src="img/icons/retime.png" width="48" height="48" alt="Edit song length button" class="controllButtons" onclick="songLengthDialogue()" title="Modify song length">
                <img src="img/icons/Export.png" width="48" height="48" alt="home Button" class="controllButtons" onclick="exportSong()" title="Export Song">
                <img src="img/icons/Home.png" width="48" height="48" alt="home Button" class="controllButtons" onclick="homeButton()" title="Return to Home Screen">
            </div>
            
            <div id="imglessButtons" class="otherBar">
                <button onclick="loopToggle(this)">Loop Song: On</button>
                <button onclick="scrollToggle(this)">Auto Scroll: Off</button>
            </div>
            <input id="timeLine" type="range" min="1" max="16" step="1" value="1" onmouseup="sliderUpdate(this)"></input>
        </div>
        
        
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
		<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
        <script src="JS/MMC2.js<?php echo "?noCache=$noCache"; ?>"></script>
        <!-- jasmid package -->
    	<script src="JS/inc/jasmid/stream.js"></script>
    	<script src="JS/inc/jasmid/midifile.js"></script>
    	<script src="JS/inc/jasmid/replayer.js"></script>
    	<script src="JS/inc/shim/WebMIDIAPI.js" type="text/javascript"></script>
        <!-- polyfill -->
    	<script src="JS/inc/shim/Base64.js" type="text/javascript"></script>
    	<script src="JS/inc/shim/Base64binary.js" type="text/javascript"></script>
    	<script src="JS/inc/shim/WebAudioAPI.js" type="text/javascript"></script>
    	<!-- midi.js package -->
    	<script src="JS/midi/audioDetect.js" type="text/javascript"></script>
    	<script src="JS/midi/gm.js" type="text/javascript"></script>
    	<script src="JS/midi/loader.js" type="text/javascript"></script>
    	<script src="JS/midi/plugin.audiotag.js" type="text/javascript"></script>
    	<script src="JS/midi/plugin.webaudio.js" type="text/javascript"></script>
    	<script src="JS/midi/plugin.webmidi.js" type="text/javascript"></script>
    	<!-- utils -->
    	<script src="JS/util/dom_request_xhr.js" type="text/javascript"></script>
    	<script src="JS/util/dom_request_script.js" type="text/javascript"></script>
    	<script type='text/javascript' src='JS/jquery.mousewheel.js'></script><!-- used for horizontal scolling -->
    	<!-- filesaver -->
    	<script src="JS/fileSaver/Blob.js" type="text/javascript"></script>
    	<script src="JS/fileSaver/FileSaver.min.js" type="text/javascript"></script>
    </body>
</html>