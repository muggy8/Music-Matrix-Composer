<?php
    $uName = addcslashes($_POST["name"], "W");
    $songID = addcslashes($_POST["songID"], "W");
    $sessionID = addcslashes($_POST["sessionID"], "W");
    $returnArray = array("success" => false, "error" => "", "trackID" => "");
    $trackDataEncoded = $_POST["data"];
    $trackDataDecoded = json_decode($trackDataEncoded, true);
    $returnArray["trackID"] = $trackDataDecoded["id"];
    
    include "../../configs/sqlConnect.php";
    $sql="select username, userID, sessionID from users inner join songs on userID = creatorID where username = '$uName' and sessionID = '$sessionID' and songID = $songID";
    $results = mysqli_query($conn, $sql);
    $rowCount = mysqli_num_rows($results);
    if ($rowCount === 1){ //the username and sessionID are ok therefore this person is probably the person who they logged in as.
        $userID=-1;
        $row=mysqli_fetch_row($results);
        $userID = $row[1];
        $instrument = $trackDataDecoded["instrument"];
        $songData = json_encode($trackDataDecoded["songData"]);
        $scale = json_encode($trackDataDecoded["scale"]);
        
        if ($trackDataDecoded["id"] == ""){//this is a new track insert it into the table
            $sql = "insert into tracks (songID, instrument, trackData, scale) values ($songID, '$instrument', '$songData', '$scale')";
            if ($conn->query($sql) === TRUE) {
                $returnArray["success"] = true;
            } else {
                $returnArray["error"] =  "Error: " . $sql . "//" . $conn->error;
            }
            $sql = "select trackID from tracks where songID = $songID and instrument='$instrument' and trackData='$songData' and scale='$scale'";
            $results = mysqli_query($conn, $sql);
            $rowCount = mysqli_num_rows($results);
            if ($rowCount === 1){
                $row=mysqli_fetch_row($results);
                $returnArray["trackID"] = $row[0];
            }
        }
        else{
            $trackID = $trackDataDecoded["id"];
            $sql = "update tracks set instrument = '$instrument', trackData = '$songData', scale='$scale' where trackID = $trackID";
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