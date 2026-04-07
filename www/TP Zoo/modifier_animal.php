<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: index.html");
    exit();
}
include("connexion.php");

$id = $_GET["id"];
$sql = "SELECT * FROM animaux WHERE id_animal='$id'";
$result = mysqli_query($conn, $sql);
$animal = mysqli_fetch_assoc($result);

$especes = mysqli_query($conn, "SELECT * FROM especes");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = $_POST["nom"];
    $id_espece = $_POST["id_espece"];
    $date_naissance = $_POST["date_naissance"];
    $sexe = $_POST["sexe"];
    $commentaire = $_POST["commentaire"];

    $sql2 = "UPDATE animaux SET pseudo='$nom', espece_id='$id_espece', date_naissance='$date_naissance', sexe='$sexe', commentaire='$commentaire' WHERE id_animal='$id'";
    mysqli_query($conn, $sql2);
    header("Location: liste_animaux.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Zoo - Modifier un animal</title>
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
        <h1>Modifier un animal</h1>

        <form method="post" action="modifier_animal.php?id=<?php echo $id; ?>">
            <label>Nom :</label>
            <input type="text" name="nom" value="<?php echo $animal['pseudo']; ?>" required><br>

            <label>Espece :</label>
            <select name="id_espece">
                <?php while ($e = mysqli_fetch_assoc($especes)) { ?>
                    <option value="<?php echo $e['id_espece']; ?>" <?php if ($e['id_espece'] == $animal['espece_id']) echo "selected"; ?>>
                        <?php echo $e['nom']; ?>
                    </option>
                <?php } ?>
            </select><br>

            <label>Date de naissance :</label>
            <input type="date" name="date_naissance" value="<?php echo $animal['date_naissance']; ?>"><br>

            <label>Sexe :</label>
            <select name="sexe">
                <option value="M" <?php if ($animal['sexe'] == 'M') echo "selected"; ?>>M</option>
                <option value="F" <?php if ($animal['sexe'] == 'F') echo "selected"; ?>>F</option>
            </select><br>

            <label>Commentaire :</label>
            <textarea name="commentaire"><?php echo $animal['commentaire']; ?></textarea><br>

            <button type="submit" class="btn">Enregistrer</button>
            <a href="liste_animaux.php" class="btn">Annuler</a>
        </form>
    </div>

</div>
</body>
</html>
