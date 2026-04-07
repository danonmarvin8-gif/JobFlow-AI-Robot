<?php
session_start();
if (!isset($_SESSION["login"]) || $_SESSION["fonction"] != "Directeur") {
    header("Location: index.html");
    exit();
}
include("connexion.php");

$sql = "SELECT * FROM personnels";
$result = mysqli_query($conn, $sql);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Zoo - Liste des employes</title>
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
        <h1>Liste des employes</h1>
        <a href="ajout_employe.html" class="btn">+ Ajouter un employe</a>
        <br><br>

        <table>
            <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prenom</th>
                <th>Fonction</th>
                <th>Login</th>
                <th>Actions</th>
            </tr>
            <?php while ($emp = mysqli_fetch_assoc($result)) { ?>
            <tr>
                <td><?php echo $emp["id_personnel"]; ?></td>
                <td><?php echo $emp["nom"]; ?></td>
                <td><?php echo $emp["prenom"]; ?></td>
                <td><?php echo $emp["fonction"]; ?></td>
                <td><?php echo $emp["login"]; ?></td>
                <td>
                    <a href="detail_employe.php?id=<?php echo $emp['id_personnel']; ?>">Voir</a>
                    <a href="modifier_employe.php?id=<?php echo $emp['id_personnel']; ?>">Modifier</a>
                    <a href="supprimer_employe.php?id=<?php echo $emp['id_personnel']; ?>" onclick="return confirm('Supprimer cet employe ?')">Supprimer</a>
                </td>
            </tr>
            <?php } ?>
        </table>
    </div>

</div>
</body>
</html>
