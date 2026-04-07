<?php
@include("connexion.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = $_POST["nom"];
    $prenom = $_POST["prenom"];
    $date_naissance = $_POST["date_naissance"];
    $sexe = $_POST["sexe"];
    $login = $_POST["login"];
    $password = $_POST["password"];
    $salaire = $_POST["salaire"];
    $fonction = $_POST["fonction"];

    $sql = "INSERT INTO personnels (nom, prenom, date_naissance, sexe, login, mdp, salaire, fonction) VALUES ('$nom', '$prenom', '$date_naissance', '$sexe', '$login', '$password', '$salaire', '$fonction')";
    mysqli_query($conn, $sql);
    
    header("Location: liste_employes.php");
    exit();
}
?>
