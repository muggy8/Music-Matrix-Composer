<?php
    $uName = addcslashes($_POST["name"], "W");
    $sessionID = addcslashes($_POST["sessionID"], "W");
    $songID = $_POST["songID"];
    $returnStuff = "{";
    
    include "../../configs/sqlConnect.php";
    $sql="select username, userID, sessionID  from users where username = '$uName' and sessionID = '$sessionID'";
    $results = mysqli_query($conn, $sql);
    $rowCount = mysqli_num_rows($results);
    if ($rowCount === 1){ //the username and sessionID are ok therefore this person is probably the person who they logged in as.
        $userID=-1;
        $row=mysqli_fetch_row($results);
        $userID = $row[1];
        
        $sql="select * from tracks where songID=$songID ORDER BY trackID ASC";
        $results = mysqli_query($conn, $sql);
        $counter = 0;
        while ($row=mysqli_fetch_assoc($results)){
            if ($counter > 0){
                $returnStuff = $returnStuff . ",";
            }
            $jsonify = array("id" => $row["trackID"], "instrument" => $row["instrument"], "songData" => json_decode($row["trackData"]), "scale" => json_decode($row["scale"]));
            $returnStuff = $returnStuff . "\"track$counter\": " . json_encode($jsonify);
            $counter = $counter +1;
        }
    }
    $returnStuff = $returnStuff . "}";
    echo $returnStuff;
    $conn->close();
?>