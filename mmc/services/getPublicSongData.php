<?php
    if (isset($_POST['songID'])){
        include "../../configs/sqlConnect.php";
        $songID = addcslashes($_POST['songID'], 'W');
        $sql = "SELECT publicData FROM `songs` where songID = $songID and public = 1";
        
        $results = mysqli_query($conn, $sql);
        $rowCount = mysqli_num_rows($results);
        if ($rowCount === 1){
            while($row = mysqli_fetch_assoc($results)) {
                echo $row['publicData'];
            }
        }
    }
?>