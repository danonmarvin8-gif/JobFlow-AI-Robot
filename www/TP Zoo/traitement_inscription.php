<?php
@include("connexion.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = mysqli_real_escape_string($conn, $_POST["nom"]);
    $prenom = mysqli_real_escape_string($conn, $_POST["prenom"]);
    $date_naissance = mysqli_real_escape_string($conn, $_POST["date_naissance"]);
    $sexe = mysqli_real_escape_string($conn, $_POST["sexe"]);
    $login = mysqli_real_escape_string($conn, $_POST["login"]);
    $password = mysqli_real_escape_string($conn, $_POST["password"]);
    $salaire = mysqli_real_escape_string($conn, $_POST["salaire"]);
    $fonction = mysqli_real_escape_string($conn, $_POST["fonction"]);

    $sql = "INSERT INTO personnels (nom, prenom, date_naissance, sexe, login, mdp, salaire, fonction) VALUES ('$nom', '$prenom', '$date_naissance', '$sexe', '$login', '$password', '$salaire', '$fonction')";
    $result = mysqli_query($conn, $sql);

    if ($result) {
        header("Location: index.html");
        exit();
    } else {
        echo "Erreur lors de l'inscription. <a href='inscription.html'>Retour</a>";
    }
} else {
    header("Location: inscription.html");
}
?>
