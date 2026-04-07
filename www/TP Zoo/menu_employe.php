<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: index.html");
    exit();
}
include("connexion.php");

$nb_animaux = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM animaux"));
$nb_especes = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM especes"));
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Zoo - Espace Employe</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">

    <div class="sidebar">
        <h2>Zoo</h2>
        <a href="menu_employe.php">Dashboard</a>
        <a href="liste_animaux.php">Animaux</a>
        <a href="liste_especes.php">Especes</a>
        <a href="logout.php">Deconnexion</a>
    </div>

    <div class="contenu">
        <h1>Tableau de bord - Employe</h1>
        <p>Bienvenue, <?php echo $_SESSION["login"]; ?></p>

        <div class="stats">
            <div class="stat-box">
                <p>Animaux</p>
                <h2><?php echo $nb_animaux; ?></h2>
            </div>
            <div class="stat-box">
                <p>Especes</p>
                <h2><?php echo $nb_especes; ?></h2>
            </div>
        </div>
    </div>

</div>
</body>
</html>
