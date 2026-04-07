<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: index.html");
    exit();
}
include("connexion.php");

$sql = "SELECT * FROM especes";
$result = mysqli_query($conn, $sql);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Zoo - Liste des especes</title>
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
        <h1>Liste des especes</h1>

        <table>
            <tr>
                <th>ID</th>
                <th>Espece</th>
                <th>Type nourriture</th>
                <th>Duree de vie (ans)</th>
                <th>Aquatique</th>
                <th>Animaux</th>
            </tr>
            <?php while ($e = mysqli_fetch_assoc($result)) { ?>
            <tr>
                <td><?php echo $e["id_espece"]; ?></td>
                <td><?php echo $e["nom"]; ?></td>
                <td><?php echo $e["type_nourriture"]; ?></td>
                <td><?php echo $e["duree_vie"]; ?></td>
                <td><?php echo ($e["aquatique"] == 1) ? "Oui" : "Non"; ?></td>
                <td><a href="detail_espece.php?id=<?php echo $e['id_espece']; ?>">Voir les animaux</a></td>
            </tr>
            <?php } ?>
        </table>
    </div>

</div>
</body>
</html>
