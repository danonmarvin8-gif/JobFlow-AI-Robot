<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: index.html");
    exit();
}
include("connexion.php");

$id = $_GET["id"];
$sql = "SELECT animaux.*, especes.nom FROM animaux JOIN especes ON animaux.espece_id = especes.id_espece WHERE animaux.id_animal = '$id'";
$result = mysqli_query($conn, $sql);
$animal = mysqli_fetch_assoc($result);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Zoo - Detail animal</title>
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
        <h1>Detail de l'animal</h1>
        <p><strong>Nom :</strong> <?php echo $animal["pseudo"]; ?></p>
        <p><strong>Espece :</strong> <?php echo $animal["nom"]; ?></p>
        <p><strong>Date de naissance :</strong> <?php echo $animal["date_naissance"]; ?></p>
        <p><strong>Sexe :</strong> <?php echo $animal["sexe"]; ?></p>
        <p><strong>Commentaire :</strong> <?php echo $animal["commentaire"]; ?></p>
        <br>
        <a href="liste_animaux.php" class="btn">Retour</a>
        <a href="modifier_animal.php?id=<?php echo $animal['id_animal']; ?>" class="btn">Modifier</a>
    </div>

</div>
</body>
</html>
