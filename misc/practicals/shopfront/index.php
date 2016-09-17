<!DOCTYPE html>

<head>
<title>Items for Sale</title>
<link rel="stylesheet" href="shopfront.css" />
</head>

<body> 

<h1>Items for Sale</h1>

<hr>

<form method="post" action="receipt.php" onsubmit="return validateForm()">

<table id="orderTable">
	<thead>	
	<tr>
		<th>Photo</th>
		<th>Item</th>
		<th>Description</th>
		<th>Price, £ (excl VAT)</th>
		<th>Quantity</th>
		<th>Cost</th>
	</tr>
	</thead>

<?php
// parse data.csv and use its fields to create a table
$file = fopen("data.csv", "r");

while (($line = fgetcsv($file)) !== false) {
	$elementId = htmlspecialchars($line[0]);
	$photoUrl = htmlspecialchars($line[1]);
	$item = htmlspecialchars($line[2]);
	$description = htmlspecialchars($line[3]);
	$price = htmlspecialchars($line[4]);
	
	echo "	<tr id=\"$elementId\">\n";
	echo "		<td class=\"photo\"><img src=\"$photoUrl\"/></td>\n";
	echo "		<td class=\"item\">$item</td>\n";
	echo "		<td class=\"description\">$description</td>\n";
	echo "		<td class=\"price\">$price</td>\n";
	echo "		<td class=\"quantity\"><input name=\"".$elementId.
			"_quantity\" type=\"number\" min=\"0\" max=\"999\"
			value=\"0\" size=\"8\" oninput=\"setCost('$elementId')\"
			/></td>\n";
	echo "		<td class=\"cost\"><input name=\"".$elementId.
			"_cost\" readonly type=\"text\" size=\"8\"/></td>\n";
	echo "	</tr>\n\n";
}

fclose($file);
?>

	<tr>
		<td colspan="5">VAT (20%)</td>
		<td><input id="vat_box" readonly type="text" name="vat" size="8" /></td>
  	</tr>

	<tr>
		<td colspan="5">Subtotal</td>
	  	<td><input id="subtotal_box" readonly type="text" name="subtotal" size="8" /></td>
	</tr>

	<tr>
		<td colspan="5">Delivery charge</td>
		<td><input id="delivery_box" readonly type="text" name="delivery" size="8" /></td>
  	</tr>

	<tr>
		<td colspan="5">Total cost</td>
		<td><input id="total_cost_box" readonly type="text" name="total_cost" size="8" /></td>
	</tr>

</table>

<hr>

<h2>Personal Details</h2>

<table>

	<tr>
		<td>Surname:</td>
		<td><input required type="text" name="surname" size="36" /></td>
	</tr>

	<tr>
		<td>First name:</td>
		<td><input required type="text" name="firstname" size="36" /></td>
	</tr>

	<tr>
		<td>Email:</td>
		<td><input required type="email" name="email" size="36" pattern=".*@.+\..*"/></td>
	</tr>

</table>

<hr> 

<h2>Payment Details</h2> 
		
<table>

	<tr> 
		<td>Payment Method:</td>
		<td><select id="payment_select" name="payment_method" size="1">
			<option value="amex" selected>Amex</option>
			<option value="mastercard">MasterCard</option>
			<option value="visa">Visa</option>
		</select></td>
	</tr>

	<tr> 
		<td>Name of Card Holder:</td>
		<td><input required type="text" name="card_name" size="36" /></td>
	</tr>

	<tr>
		<td>Card Number:</td>
		<td><input required id="card_number_box" type="text" name="card_number" size="19" pattern="[0-9]{16,}" maxlength="16"/></td>
	</tr>

	<tr>
		<td>Security Code:</td>
		<td><input required type="text" name="sec_code" size="3" pattern="[0-9]{3,}" maxlength="3"/></td>
	</tr>

</table>

<hr>

<h2>Shipping Details</h2>

<table>

	<tr>
		<td>Address:</td>
		<td><input required type="text" name="ship_address" size="64" /></td>
	</tr>

	<tr>
		<td>City/ Town:</td>
		<td><input required type="text" name="ship_city" size="64" /></td>
	</tr>

	<tr>
		<td>Region:</td>
		<td><input required type="text" name="ship_region" size="64" /></td>
	</tr>

	<tr>
		<td>Postcode:</td>
		<td><input required type="text" name="ship_postcode" size="12" pattern="^[a-zA-Z]{1,2}[0-9]\d?\s?[0-9][a-zA-Z]{2}$"/></td>
	</tr>

	<tr>
		<td>Country:</td>
		<td><input required type="text" name="ship_country" size="12" /></td>
	</tr>

</table>
 
<hr>

<p>
	<input type="submit"/>
</p>

</form>

<script src="shopfront.js"></script>

</body>
</html>
