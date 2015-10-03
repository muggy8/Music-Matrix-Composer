<?php
    $uName = addcslashes($_POST["name"], "W");
    $songID = addcslashes($_POST["songID"], "W");;
    $sessionID = addcslashes($_POST["sessionID"], "W");
    $returnArray = array("success" => false, "error" => "");
    $trackID = $_POST["trackID"];
    
    include "../../configs/sqlConnect.php";
    $sql="select username, userID, sessionID  from users where username = '$uName' and sessionID = '$sessionID'";
    $results = mysqli_query($conn, $sql);
    $rowCount = mysqli_num_rows($results);
    if ($rowCount === 1){
        $userID=-1;
        $row=mysqli_fetch_row($results);
        $userID = $row[1];
        
        //user id is found and the session id and username is correct do stuff here
        // DELETE FROM orders WHERE id_users = 1 AND id_product = 2 LIMIT 1
        $sql = "delete from tracks where songID = $songID and trackID = $trackID";
        if ($conn->query($sql) === TRUE) {
            $returnArray["success"] = true;
        } else {
            $returnArray["error"] =  "Error: " . $sql . " + " . $conn->error;
        }
    }
    echo json_encode($returnArray);
    $conn->close();
?>