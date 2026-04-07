<?php
session_start();
if (!isset($_SESSION["login"]) || $_SESSION["fonction"] != "Directeur") {
    header("Location: index.html");
    exit();
}
include("connexion.php");

$id = $_GET["id"];
$sql = "SELECT * FROM personnels WHERE id_personnel='$id'";
$result = mysqli_query($conn, $sql);
$emp = mysqli_fetch_assoc($result);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Zoo - Detail employe</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">

    <div class="sidebar">
        <h2>Zoo</h2>
        <a href="menu_admin.php">Dashboard</a>
        <a href="liste_animaux.php">Animaux</a>
        <a href="liste_especes.php">Especes</a>
        <a href="liste_employes.php">Employes</a>
        <a href="logout.php">Deconnexion</a>
    </div>

    <div class="contenu">
        <h1>Detail de l'employe</h1>
        <p><strong>Nom :</strong> <?php echo $emp["nom"]; ?></p>
        <p><strong>Prenom :</strong> <?php echo $emp["prenom"]; ?></p>
        <p><strong>Date de naissance :</strong> <?php echo $emp["date_naissance"]; ?></p>
        <p><strong>Sexe :</strong> <?php echo $emp["sexe"]; ?></p>
        <p><strong>Login :</strong> <?php echo $emp["login"]; ?></p>
        <p><strong>Salaire :</strong> <?php echo $emp["salaire"]; ?> €</p>
        <p><strong>Fonction :</strong> <?php echo $emp["fonction"]; ?></p>
        <br>
        <a href="liste_employes.php" class="btn">Retour</a>
        <a href="modifier_employe.php?id=<?php echo $emp['id_personnel']; ?>" class="btn">Modifier</a>
    </div>

</div>
</body>
</html>
