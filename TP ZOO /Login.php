<body>
    <html>
    <?php
    session_start();

    @include("connexion.php");
    $message = "";

    if ($_SERVER["REQUEST_METHOD"] == "POST") {

        $login = mysqli_real_escape_string($conn, $_POST["login"]);
        $password = mysqli_real_escape_string($conn, $_POST["mdp"]);

        $sql = "SELECT * FROM Users
            WHERE login='$login' AND mdp='$password'";

        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) == 1) {

            $user = mysqli_fetch_assoc($result);

            $_SESSION["login"] = $user["login"];
            $_SESSION["role"] = $user["role"];

            if ($user["role"] == "admin") {
                header("Location: menu_admin.php");
            } elseif ($user["role"] == "enseignant") {
                header("Location: menu_enseignant.php");
            } else {
                header("Location: menu_etudiant.php");
            }

            exit();

        } else {
            $message = "Login ou mot de passe incorrect !";
        }
    }
    ?>
</body>

</html>