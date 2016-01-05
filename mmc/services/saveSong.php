<?php
    $uName = addcslashes($_POST["name"], "W");
    $sessionID = addcslashes($_POST["sessionID"], "W");
    $returnArray = array("success" => false, "error" => "", "songID" => "");
    $songDataEncoded = $_POST["data"];
    $songDataDecoded = json_decode($songDataEncoded, true);
    $returnArray["songID"] = $songDataDecoded["songID"];
    
    include "../../configs/sqlConnect.php";
    $sql="select username, userID, sessionID  from users where username = '$uName' and sessionID = '$sessionID'";
    $results = mysqli_query($conn, $sql);
    $rowCount = mysqli_num_rows($results);
    if ($rowCount === 1){
        $userID=-1;
        $row=mysqli_fetch_row($results);
        $userID = $row[1];
        
        if ($songDataDecoded["songID"] == ""){
            $time = time();
            $songName = addcslashes($songDataDecoded["name"], "W");
            $songDuration = addcslashes($songDataDecoded["length"], "W");
            $songNPS = addcslashes($songDataDecoded["nps"], "W");
            $sql = "insert into songs (name, creatorID, timeCreated, public, nps, duration) values ('" . $songName . "', '$userID', " . $time . " , 0, $songNPS, $songDuration)"; //create new song entry in database;
            if ($conn->query($sql) === TRUE) {
                $returnArray["success"] = true;
            } else {
                $returnArray["error"] =  "Error: " . $sql . "//" . $conn->error;
            }
            
            $sql="select songID from songs where name = '$songName' and timeCreated = $time and creatorID = $userID and nps = $songNPS and duration = $songDuration";
            $results = mysqli_query($conn, $sql);
            $rowCount = mysqli_num_rows($results);
            if ($rowCount === 1){
                $row=mysqli_fetch_row($results);
                $returnArray["songID"] = $row[0];
            }
        }
        else{ //there is already a song ID so we'll just update the name of the song instead.
            $songID = $songDataDecoded["songID"];
            $songName = addcslashes($songDataDecoded["name"], "W");
            $songNPS = addcslashes($songDataDecoded["nps"], "W");
            
            $sql = "update songs set name = '$songName', nps = $songNPS where songID = $songID and creatorID = $userID";
            if ($conn->query($sql) === TRUE) {
                $returnArray["success"] = true;
            } else {
                $returnArray["error"] =  "Error: " . $sql . "//" . $conn->error;
            }
        }
    }
    echo json_encode($returnArray);
    $conn->close();
?>