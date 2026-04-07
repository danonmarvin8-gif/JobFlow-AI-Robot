Espace de stockage saturé depuis 17 heures … Si votre espace de stockage est plein pendant plus de deux ans, vos
fichiers risquent d'être supprimés de Drive et de Photos.
<?php
@include("connexion.php");

$b = $_POST["nom"];
$c = $_POST["prenom"];
$d = $_POST["date_naissance"];
$e = $_POST["email"];
$f = $_POST["telephone"];

$reql = "INSERT INTO etudiants (nom, prenom, date_naissance, email, telephone) VALUES ('$b', '$c', '$d', '$e', '$f')";
$rl = mysqli_query($conn, $reql);


$success = ($rl === TRUE);

mysqli_close($conn);
?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Etudiant Enregistré</title>


    <style>
        body {
            background-color: #f4f4f4;
            font-family: 'Lato', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e0e0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        /* Bandeau supérieur universitaire */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 8px;
            background: linear-gradient(90deg, #002147 0%, #002147 30%, #c5b358 30%, #c5b358 70%, #002147 70%, #002147 100%);
            z-index: 1000;
        }

        .confirmation-container {
            background: white;
            padding: 60px 50px;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            text-align: center;
            max-width: 500px;
            border: 1px solid #d1d1d1;
            position: relative;
            z-index: 10;
        }

        /* Icône de succès (Check animé) */
        .success-icon {
            width: 100px;
            height: 100px;
            margin: 0 auto 30px auto;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(39, 174, 96, 0.3);
            animation: successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .success-icon::after {
            content: '✓';
            font-size: 4rem;
            color: white;
            font-weight: bold;
            animation: checkAppear 0.3s ease 0.2s both;
        }

        @keyframes successPop {
            0% {
                transform: scale(0) rotate(-180deg);
                opacity: 0;
            }

            100% {
                transform: scale(1) rotate(0deg);
                opacity: 1;
            }
        }

        @keyframes checkAppear {
            0% {
                transform: scale(0);
            }

            100% {
                transform: scale(1);
            }
        }

        h1 {
            font-family: 'Libre Baskerville', serif;
            color: #002147;
            font-size: 2rem;
            margin-bottom: 15px;
        }

        p {
            color: #666;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .user-info {
            background: #f9f9f9;
            padding: 15px 20px;
            border-radius: 5px;
            border-left: 4px solid #c5b358;
            margin-bottom: 30px;
            text-align: left;
        }

        .user-info strong {
            color: #002147;
        }

        /* Bouton de retour */
        .btn-retour {
            display: inline-block;
            padding: 14px 40px;
            background-color: #002147;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(0, 33, 71, 0.2);
        }

        .btn-retour:hover {
            background-color: #003366;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 33, 71, 0.3);
        }

        /* Compteur de redirection */
        .redirect-timer {
            margin-top: 20px;
            font-size: 0.9rem;
            color: #999;
        }

        /* Animation de particules (optionnel si tu veux reprendre le fond animé) */
        #academic-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        }

        @keyframes floatUp {
            0% {
                transform: translateY(100vh) rotate(0deg) scale(0.8);
                opacity: 0;
            }

            20% {
                opacity: 0.6;
            }

            80% {
                opacity: 0.6;
            }

            100% {
                transform: translateY(-20vh) rotate(360deg) scale(1.2);
                opacity: 0;
            }
        }
    </style>

    <?php if ($success): ?>
        <!-- Script de redirection automatique après 5 secondes -->
        <script>
            let countdown = 5;

            function updateTimer() {
                const timerEl = document.getElementById('timer');
                if (timerEl) timerEl.textContent = countdown;
                countdown--;

                if (countdown < 0) {
                    window.location.href = 'menu_admin.php';
                }
            }

            // Lancement du compte à rebours
            setInterval(updateTimer, 1000);
        </script>
    <?php endif; ?>
</head>

<body>

    <div class="confirmation-container">
        <?php if ($success): ?>
            <!-- CAS DE SUCCÈS -->
            <div class="success-icon"></div>

            <h1>Étudiant Enregistré !</h1>

            <p>Félicitations, l'étudiant a été enregistré avec succès.</p>

            <div class="user-info">
                <strong>Nom :</strong> <?php echo htmlspecialchars($b); ?> <strong>Prénom :</strong>
                <?php echo htmlspecialchars($c); ?>
            </div>

            <p style="font-size: 0.95rem; color: #888;">
                Vous pouvez maintenant vous connecter avec vos identifiants.
            </p>

            <a href="menu_admin.php" class="btn-retour">Retour à l'administration</a>

            <div class="redirect-timer">
                Redirection automatique dans <span id="timer">5</span> secondes...
            </div>

        <?php else: ?>
            <!-- CAS D'ERREUR -->
            <div class="success-icon" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">
                <span style="font-size: 4rem; color: white;">✗</span>
            </div>

            <h1 style="color: #c0392b;">Erreur d'enregistrement</h1>

            <p>Désolé, une erreur s'est produite lors de l'enregistrement de l'étudiant.</p>

            <p style="font-size: 0.9rem; color: #999;">
                Possible : L'identifiant existe déjà ou la connexion a échoué.
            </p>

            <a href="enregistrer.html" class="btn-retour" style="background-color: #c0392b;">
                Réessayer
            </a>
        <?php endif; ?>
    </div>


    <script src="enregistrer.js"></script>

</body>

</html>