<?php
    function curPageURL() {
        $pageURL = 'http';
        if ($_SERVER["HTTPS"] == "on") {$pageURL .= "s";}
        $pageURL .= "://";
        if ($_SERVER["SERVER_PORT"] != "80") {
            $pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
        } else {
            $pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
        }
        return $pageURL;
    }
    
    $txt = $_POST['txt'];
    
    $save_dir = 'tmp/';
	srand((double)microtime()*1000000);
	$file = $save_dir.rand().'.mid';

	/****************************************************************************
	MIDI CLASS CODE
	****************************************************************************/
	require('./classes/midi.class.php');

	@set_time_limit (600); # 10 minutes

	$midi = new Midi();
	$midi->importXml($txt);		
	$midi->saveMidFile($file, 0666);
	//$midi->playMidFile($file,$visible,$autostart,$loop,$player);
	
	$dlLink = str_replace("xml2midiService", "download", curPageURL());
?>

<a target="_blank" href="<?php echo $dlLink ?>?f=<?php echo urlencode($file)?>">Download your Midi file</a>