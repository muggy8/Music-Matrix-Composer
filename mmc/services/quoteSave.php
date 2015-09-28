<?php
    $uName = addcslashes($_POST["name"], "W");
    $songID = addcslashes($_POST["songID"], "W");
    $sessionID = addcslashes($_POST["sessionID"], "W");
    $returnArray = array("success" => false, "error" => "", "quoteID" => "");
    $trackDataEncoded = $_POST["data"];
    $trackDataDecoded = json_decode($trackDataEncoded, true);
    $returnArray["quoteID"] = $trackDataDecoded["id"];
    
    include "../../configs/sqlConnect.php";
    $sql="select username, userID, sessionID  from users where username = '$uName' and sessionID = '$sessionID'";
    $results = mysqli_query($conn, $sql);
    $rowCount = mysqli_num_rows($results);
    if ($rowCount === 1){ //the username and sessionID are ok therefore this person is probably the person who they logged in as.
        $userID=-1;
        $row=mysqli_fetch_row($results);
        $userID = $row[1];
        
        $now = time();
        $QName = $trackDataDecoded["comboName"];
        $quoteData = json_encode($trackDataDecoded["noteDeltas"]);
        
        if ($trackDataDecoded["id"] == ""){//this is a new track insert it into the table
            if ( $trackDataDecoded["inUse"]){ // if track is in use then save it or else no point in saving it
                $sql = "insert into Quotes (SongID, Time, name, Data) values ($songID, $now, '$QName', '$quoteData')";
                if ($conn->query($sql) === TRUE) {
                    $returnArray["success"] = true;
                } else {
                    $returnArray["error"] =  "Error: " . $sql . "//" . $conn->error;
                }
                $sql = "select QuoteID from Quotes where SongID = $songID and Time = $now and name = '$QName' and Data = '$quoteData'";
                $results = mysqli_query($conn, $sql);
                $rowCount = mysqli_num_rows($results);
                if ($rowCount === 1){
                    $row=mysqli_fetch_row($results);
                    $returnArray["quoteID"] = $row[0];
                }
            }
        }
        else{ //there's already a quote ID so we overwrite the data from last time here.
            $quoteID = $trackDataDecoded["id"];
            if ($trackDataDecoded["inUse"]){
                $sql = "update Quotes set name = '$QName', Data = '$quoteData' where QuoteID = $quoteID";
                if ($conn->query($sql) === TRUE) {
                    $returnArray["success"] = true;
                } else {
                    $returnArray["error"] =  "Error: " . $sql . "//" . $conn->error;
                }
            }
            else{ // quote no longer in use
                $sql = "delete from Quotes where QuoteID = $quoteID";
                if ($conn->query($sql) === TRUE) {
                    $returnArray["success"] = true;
                } else {
                    $returnArray["error"] =  "Error: " . $sql . "//" . $conn->error;
                }
            }
        }
    }
    
    echo json_encode($returnArray);
    $conn->close();
?>