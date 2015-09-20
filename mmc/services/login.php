<?php
    $uName = addcslashes($_POST["name"], "W");
    $pass = addcslashes($_POST["pass"], "W");
    $encodedPass = sha1($pass);
    $returnArray = array("success" => false, "error" => "", "uName" => $uName, "sessionID" => false);
    
    include "../../configs/sqlConnect.php";
    $sql="select username, password, sessionID from users where username = '$uName' and password = '$encodedPass'";
    $results = mysqli_query($conn, $sql);
    $rowCount = mysqli_num_rows($results);
    if ($rowCount === 1){
        $tempID = time();
        $sql = "UPDATE  users SET  sessionID = '$tempID' WHERE  username = '$uName' and password = '$encodedPass'";
        $results = mysqli_query($conn, $sql);
        $returnArray["success"] = true;
        $returnArray["sessionID"] = $tempID;
    }
    else{
        $returnArray["error"] = "account not found";
    }
   
    echo json_encode($returnArray);
    $conn->close();
?>