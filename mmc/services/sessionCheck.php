<?php
    $uName = addcslashes($_POST["name"], "W");
    $sessionID = $_POST["sessionID"];
    
    include "../../configs/sqlConnect.php";
    $sql="select username, sessionID from users where username = '$uName' and sessionID = '$sessionID'";
    $results = mysqli_query($conn, $sql);
    $rowCount = mysqli_num_rows($results);
    if ($rowCount === 1){
        echo true;
    }
    else{
        echo false;
    }
?>