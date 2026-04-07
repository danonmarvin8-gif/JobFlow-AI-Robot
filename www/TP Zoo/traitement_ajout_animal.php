<?php

@include("connexion.php");

$nom = $_POST["nom"];
$id_espece = $_POST["id_espece"];
$date_naissance = $_POST["date_naissance"];
$sexe = $_POST["sexe"];
$commentaire = $_POST["commentaire"];

$sql = "INSERT INTO animaux (pseudo, espece_id, date_naissance, sexe, commentaire) VALUES ('$nom', '$id_espece', '$date_naissance', '$sexe', '$commentaire')";
$result = mysqli_query($conn, $sql);

header("Location: liste_animaux.php");
?>
