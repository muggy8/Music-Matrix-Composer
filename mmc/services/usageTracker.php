<?php
    include "../../configs/sqlConnect.php";
    date_default_timezone_set('America/Los_Angeles');
    $uName = addcslashes($_POST["name"] , "W");
    $sName = addcslashes($_POST["song"] , "W");
    $sLength = addcslashes($_POST["len"] , "W");
    
	function get_client_ip() {
		$ipaddress = '';
		if (getenv('HTTP_CLIENT_IP'))
			$ipaddress = getenv('HTTP_CLIENT_IP');
		else if(getenv('HTTP_X_FORWARDED_FOR'))
			$ipaddress = getenv('HTTP_X_FORWARDED_FOR');
		else if(getenv('HTTP_X_FORWARDED'))
			$ipaddress = getenv('HTTP_X_FORWARDED');
		else if(getenv('HTTP_FORWARDED_FOR'))
			$ipaddress = getenv('HTTP_FORWARDED_FOR');
		else if(getenv('HTTP_FORWARDED'))
		   $ipaddress = getenv('HTTP_FORWARDED');
		else if(getenv('REMOTE_ADDR'))
			$ipaddress = getenv('REMOTE_ADDR');
		else
			$ipaddress = 'UNKNOWN';
		return $ipaddress;
	}
	
	$ip = get_client_ip();
	
	$time = date('Y-m-d-h-m-s');
	
	$sql = "insert into tracker (ip, time, user, song, length) values ('$ip', '$time', '$uName', '$sName', $sLength)" ;
	
	$conn->query($sql);