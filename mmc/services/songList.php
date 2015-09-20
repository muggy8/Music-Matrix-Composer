<?php
    $uName = addcslashes($_POST["name"], "W");
    $sessionID = addcslashes($_POST["sessionID"], "W");
    $returnStuff = "{";
    
    include "../../configs/sqlConnect.php";
    $sql="select username, userID, sessionID  from users where username = '$uName' and sessionID = '$sessionID'";
    $results = mysqli_query($conn, $sql);
    $rowCount = mysqli_num_rows($results);
    if ($rowCount === 1){
        $userID=-1;
        $row=mysqli_fetch_row($results);
        $userID = $row[1];
        
        $sql="select name, songID, public, nps, duration from songs where creatorID = $userID";
        $results = mysqli_query($conn, $sql);
        $count = 0;
        while($row = mysqli_fetch_assoc($results)) {
            if ($count > 0){
                $returnStuff = $returnStuff . ", ";
            }
            $returnStuff = $returnStuff . "\"song$count\" : {\"name\": \"" . $row["name"] . "\" , \"songID\": " . $row["songID"] . " , \"public\": " . $row["public"] . ", \"nps\":" . $row["nps"] . ", \"length\":" . $row["duration"] . "}";
            $count = $count +1;
        }
    }
    $returnStuff = $returnStuff . "}";
    
    
    echo $returnStuff;
    $conn->close();
?>