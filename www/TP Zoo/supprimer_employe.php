<?php
session_start();
if (!isset($_SESSION["login"]) || $_SESSION["fonction"] != "Directeur") {
    header("Location: index.html");
    exit();
}
@include("connexion.php");

$id = $_GET["id"];
$sql = "DELETE FROM personnels WHERE id_personnel='$id'";
mysqli_query($conn, $sql);

header("Location: liste_employes.php");
?>
