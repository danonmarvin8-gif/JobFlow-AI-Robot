<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: index.html");
    exit();
}
@include("connexion.php");

$id = $_GET["id"];
$sql = "DELETE FROM animaux WHERE id_animal='$id'";
mysqli_query($conn, $sql);

header("Location: liste_animaux.php");
?>
