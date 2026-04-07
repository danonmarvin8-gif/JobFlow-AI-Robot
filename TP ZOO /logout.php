Espace de stockage saturé depuis 17 heures … Si votre espace de stockage est plein pendant plus de deux ans, vos
fichiers risquent d'être supprimés de Drive et de Photos.
<?php

session_start();
session_unset();
session_destroy();

header('location:index.php')

    ?>