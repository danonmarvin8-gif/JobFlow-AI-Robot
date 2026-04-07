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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = $_POST["nom"];
    $prenom = $_POST["prenom"];
    $date_naissance = $_POST["date_naissance"];
    $sexe = $_POST["sexe"];
    $login = $_POST["login"];
    $password = $_POST["password"];
    $salaire = $_POST["salaire"];
    $fonction = $_POST["fonction"];

    $sql2 = "UPDATE personnels SET nom='$nom', prenom='$prenom', date_naissance='$date_naissance', sexe='$sexe', login='$login', mdp='$password', salaire='$salaire', fonction='$fonction' WHERE id_personnel='$id'";
    mysqli_query($conn, $sql2);
    header("Location: liste_employes.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Zoo - Modifier un employe</title>
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
        <h1>Modifier un employe</h1>

        <form method="post" action="modifier_employe.php?id=<?php echo $id; ?>">
            <div class="form-group">
                <label>Nom :</label>
                <input type="text" name="nom" value="<?php echo $emp['nom']; ?>" required>
            </div>
            <div class="form-group">
                <label>Prenom :</label>
                <input type="text" name="prenom" value="<?php echo $emp['prenom']; ?>" required>
            </div>
            <div class="form-group">
                <label>Date de naissance :</label>
                <input type="date" name="date_naissance" value="<?php echo $emp['date_naissance']; ?>" required>
            </div>
            <div class="form-group">
                <label>Sexe :</label>
                <select name="sexe">
                    <option value="H" <?php if ($emp['sexe'] == 'H') echo "selected"; ?>>H</option>
                    <option value="F" <?php if ($emp['sexe'] == 'F') echo "selected"; ?>>F</option>
                </select>
            </div>
            <div class="form-group">
                <label>Login :</label>
                <input type="text" name="login" value="<?php echo $emp['login']; ?>" required>
            </div>
            <div class="form-group">
                <label>Mot de passe :</label>
                <input type="password" name="password" value="<?php echo $emp['mdp']; ?>" required>
            </div>
            <div class="form-group">
                <label>Salaire :</label>
                <input type="text" name="salaire" value="<?php echo $emp['salaire']; ?>" required>
            </div>
            <div class="form-group">
                <label>Fonction :</label>
                <select name="fonction">
                    <option value="Employe" <?php if ($emp['fonction'] == 'Employe') echo "selected"; ?>>Employe</option>
                    <option value="Directeur" <?php if ($emp['fonction'] == 'Directeur') echo "selected"; ?>>Directeur</option>
                </select>
            </div>
            <button type="submit" class="btn">Enregistrer</button>
            <a href="liste_employes.php" class="btn">Annuler</a>
        </form>
    </div>

</div>
</body>
</html>
