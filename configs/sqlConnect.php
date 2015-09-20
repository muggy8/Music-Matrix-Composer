<?php
	$servername = "<Your Server Name Here>";
	$username = "Your Username Here";
	$password = "Your Password Here";
	
	// Create connection
	$conn = new mysqli($servername, $username, $password, "mugdev_com");
	
	// Check connection
	if ($conn->connect_error) {
	    die("Connection failed: " . $conn->connect_error);
	} 
	//echo "Connected successfully";
?>