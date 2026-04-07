<?php
session_start();
@include("connexion.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $login = mysqli_real_escape_string($conn, $_POST["login"]);
    $password = mysqli_real_escape_string($conn, $_POST["mdp"]);

    $sql = "SELECT * FROM personnels WHERE login='$login' AND mdp='$password'";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) == 1) {
        $user = mysqli_fetch_assoc($result);
        $_SESSION["login"] = $user["login"];
        $_SESSION["fonction"] = $user["fonction"];
        $_SESSION["id"] = $user["id"];

        if ($user["fonction"] == "Directeur") {
            header("Location: menu_admin.php");
        } else {
            header("Location: menu_employe.php");
        }
        exit();
    } else {
        echo "Login ou mot de passe incorrect ! <a href='index.html'>Retour</a>";
    }
} else {
    header("Location: index.html");
}
?>
