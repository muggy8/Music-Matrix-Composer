<?php
    $returnStuff = "{";
    include "../../configs/sqlConnect.php";
    
    $sql="select name, songID, creatorID, public, nps, duration, username, publicData from songs inner join users on songs.creatorID = users.userID where public = 1 ORDER BY `songs`.`timeCreated` DESC LIMIT 0 , 30";
    $results = mysqli_query($conn, $sql);
    $count = 0;
    while($row = mysqli_fetch_assoc($results)) {
        if ($count > 0){
            $returnStuff = $returnStuff . ", ";
        }
        
        $returnStuff = $returnStuff . "\"song$count\" : {\"songName\": \"" . $row["name"] . "\" , \"songID\": " . $row["songID"] . " , \"public\": " . $row["public"] . ", \"nps\":" . $row["nps"] . ", \"length\":" . $row["duration"] . ", \"creator\": \"" . $row["username"] ."\"}";
        
        $count = $count +1;
    }
    
    $returnStuff = $returnStuff . "}";
    echo $returnStuff;
    $conn->close();
?>