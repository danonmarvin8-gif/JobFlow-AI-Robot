<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: index.html");
    exit();
}
include("connexion.php");

$sql = "SELECT animaux.id_animal, animaux.pseudo, animaux.date_naissance, animaux.sexe, especes.nom FROM animaux JOIN especes ON animaux.espece_id = especes.id_espece";
$result = mysqli_query($conn, $sql);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Zoo - Liste des animaux</title>
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
        <h1>Liste des animaux</h1>
        <a href="ajout_animal.html" class="btn">+ Ajouter un animal</a>
        <br><br>

        <table>
            <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Espece</th>
                <th>Date de naissance</th>
                <th>Sexe</th>
                <th>Actions</th>
            </tr>
            <?php while ($animal = mysqli_fetch_assoc($result)) { ?>
            <tr>
                <td><?php echo $animal["id_animal"]; ?></td>
                <td><?php echo $animal["pseudo"]; ?></td>
                <td><?php echo $animal["nom"]; ?></td>
                <td><?php echo $animal["date_naissance"]; ?></td>
                <td><?php echo $animal["sexe"]; ?></td>
                <td>
                    <a href="detail_animal.php?id=<?php echo $animal['id_animal']; ?>">Voir</a>
                    <a href="modifier_animal.php?id=<?php echo $animal['id_animal']; ?>">Modifier</a>
                    <a href="supprimer_animal.php?id=<?php echo $animal['id_animal']; ?>" onclick="return confirm('Supprimer cet animal ?')">Supprimer</a>
                </td>
            </tr>
            <?php } ?>
        </table>
    </div>

</div>
</body>
</html>
