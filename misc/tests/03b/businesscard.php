<!DOCTYPE html>

<html>

<head>
<meta charset="UTF-8">
<title>Your New Business Card</title>
<link rel="stylesheet" href="businesscard.css">
</head>

<body>

<?php

function getFormInfo($v) {
    return isset($_POST[$v]) ? htmlspecialchars($_POST[$v]) : null;
}

$firstname = getFormInfo("firstname");
$lastname = getFormInfo("lastname");
$email = getFormInfo("email");
$colour = getFormInfo("colour");
$font = getFormInfo("font");

    echo "<businesscard style=\"font-family: ".$font."; color: ".$colour.";\">\n";
    echo "  <name>".$firstname." ".$lastname."</name>\n";
    echo "  <email>".$email."</email>\n";
    if ($telephone = getFormInfo("telephone")) {
        echo "  <telephone>".$telephone."</telephone>\n";
    }
    echo "</businesscard>";
?>

</body>

</html>

