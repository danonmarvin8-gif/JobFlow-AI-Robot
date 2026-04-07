<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: index.html");
    exit();
}
include("connexion.php");

$id = $_GET["id"];
$sql_espece = "SELECT * FROM especes WHERE id_espece='$id'";
$r_espece = mysqli_query($conn, $sql_espece);
$espece = mysqli_fetch_assoc($r_espece);

$sql = "SELECT * FROM animaux WHERE espece_id='$id'";
$result = mysqli_query($conn, $sql);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Zoo - Detail espece</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">

    <div class="sidebar">
        <h2>Zoo</h2>
        <a href="<?php echo ($_SESSION['fonction'] == 'Directeur') ? 'menu_admin.php' : 'menu_employe.php'; ?>">Dashboard</a>
        <a href="liste_animaux.php">Animaux</a>
        <a href="liste_especes.php">Especes</a>
        <?php if ($_SESSION["fonction"] == "Directeur") { ?>
            <a href="liste_employes.php">Employes</a>
        <?php } ?>
        <a href="logout.php">Deconnexion</a>
    </div>

    <div class="contenu">
        <h1>Espece : <?php echo $espece["nom"]; ?></h1>

        <h2>Animaux de cette espece :</h2>
        <table>
            <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Date naissance</th>
                <th>Sexe</th>
            </tr>
            <?php while ($a = mysqli_fetch_assoc($result)) { ?>
            <tr>
                <td><?php echo $a["id_animal"]; ?></td>
                <td><?php echo $a["pseudo"]; ?></td>
                <td><?php echo $a["date_naissance"]; ?></td>
                <td><?php echo $a["sexe"]; ?></td>
            </tr>
            <?php } ?>
        </table>
        <br>
        <a href="liste_especes.php" class="btn">Retour</a>
    </div>

</div>
</body>
</html>
