<!DOCTYPE html>
<html>

<head>
<title>Order Receipt</title>
<link rel="stylesheet" href="receipt.css">
</head>

<body>


<?php

function getFormInfo($v) {
    return isset($_POST[$v]) ? htmlspecialchars($_POST[$v]) : null;
}

// returns an error page if essential info is missing (although
// index.php should make sure this is all present)

if (!($firstname = getFormInfo("firstname")) ||
    !($surname = getFormInfo("surname")) ||
    !($email = getFormInfo("email")) ||
    !($paymentMethod = getFormInfo("payment_method")) ||
    !($cardName = getFormInfo("card_name")) ||
    !($cardNumber = getFormInfo("card_number")) ||
    !($securityCode = getFormInfo("sec_code")) ||
    !($address = getFormInfo("ship_address")) ||
    !($city = getFormInfo("ship_city")) ||
    !($region = getFormInfo("ship_region")) ||
    !($postcode= getFormInfo("ship_postcode")) ||
    !($shipCountry = getFormInfo("ship_country"))
    ) {
   	echo "<p>Error: essential information missing in form!</p>";    
}

else {
	echo "<h1>Order Receipt</h1>\n\n";
	echo "<hr>\n\n";
	echo "<h2>Purchase Summary</h2>\n\n";
	
	echo "<table id=\"products\">\n";
	echo "	<tr>\n";
	echo "		<td>Product</td>\n";
	echo "		<td>Quantity</td>\n";
	echo "		<td>Cost, £ (excl VAT)</td>\n";
	echo "	</tr>\n";
	
	// creates table rows for each product purchased
	createProductRows();

	echo "</table>\n\n";
	echo "<p>Total (inc.VAT & delivery): ".getFormInfo("total_cost")."</p>\n";

	echo "<h2>Customer Details</h2>\n\n";

	echo "<table id=\"details\">\n";
	// create table rows containing essential customer info
	createDetailsRow("Name", $firstname." ".$surname);
	createDetailsRow("Email", $email);
	createDetailsRow("Payment Method", $paymentMethod);
	createDetailsRow("Card Number", substr_replace($cardNumber, str_repeat("x", 12), 2, -2));
	createDetailsRow("Shipping Address", "<p>".$address.",</p>".
					"\n\t\t<p>".$city.",</p>".
					"\n\t\t<p>".$region.",</p>".
					"\n\t\t<p>".$postcode.",</p>".
					"\n\t\t<p>".$shipCountry."</p>");
	echo "</table>\n\n";
	echo "<p>".date("Y-m-d h:i:sa")."</p>\n\n";
}

function createDetailsRow($cell1, $cell2) {
	echo "	<tr>\n";
	echo "		<td>$cell1</td>\n";
	echo "		<td>".$cell2."</td>\n";
	echo "	<tr>\n\n";
}

function createProductRows() {
$file = fopen("data.csv", "r");

	// check through each item in data.csv
	while (($line = fgetcsv($file)) !== false) {
		$elementId = htmlspecialchars($line[0]);
		$product = htmlspecialchars($line[2]);
		
		// if the customer has ordered > 0 of the current
		// item, create a row for it in the receipt table
		// including its quantity and cost.
		$quantity = getFormInfo($elementId."_quantity");
		$cost = getFormInfo($elementId."_cost");
		if ($quantity != 0) {
			echo "	<tr>\n";
			echo "		<td>$product</td>\n";
			echo "		<td>$quantity</td>\n";
			echo "		<td>$cost</td>\n";
			echo "	</tr>\n\n";
		}		
	}
}
?>

</body>

</html>
