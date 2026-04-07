Espace de stockage saturé depuis 17 heures … Si votre espace de stockage est plein pendant plus de deux ans, vos
fichiers risquent d'être supprimés de Drive et de Photos.
<?php
$conn = mysqli_connect("localhost", "root", "mysql", "Zoo");
if (!$conn) {
    die("<div class='container'><div class='alert alert--danger'>❌ Connexion BD impossible.</div></div>");
}

?>