<?php
    include "../../configs/sqlConnect.php";
    $uName = addcslashes($_POST["name"] , "W");
    $pass1 = addcslashes($_POST["pass1"] , "W");
    $pass2 = addcslashes($_POST["pass2"] , "W");
    $returnArray = array("success" => false, "error" => "", "uName" => $uName, "sessionID" => false );
    
    if ($pass1==$pass2){
        if (empty($pass1)){
            $returnArray["error"] = "no password";
            
        }
        if (empty($uName)){
            $returnArray["error"] = "no username";
        }
        else{
            // connect to sql and try to create account
            include "../../configs/sqlConnect.php";
            $sql = "select * from users where username = '$uName'";
            $results = mysqli_query($conn, $sql);
            $rowCount = mysqli_num_rows($results);
            if ($rowCount === 0){
                $tempID = time();
                $encodedPass = sha1($pass1);
                $sql = "insert into users (username, password, sessionID, email, moderator, bannedUntil, donated, icon, bio, age, birthday, gender) values ('$uName', '$encodedPass', $tempID, '', 0, 0, 0, '', '', 0, 0, 0)";
                if ($conn->query($sql) === TRUE) { 
					$returnArray["success"] = true;
					$returnArray["sessionID"] = $tempID;
				} else {
					$returnArray["error"] =  "Error: " . $sql . " -> " . $conn->error;
				}
            }
            else{
                $returnArray["error"] = "username already exists";
            }
        }
    }
    else{
        $returnArray["error"] = 'password not match';
    }
    
    echo json_encode($returnArray);
?>