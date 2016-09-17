function setCost(id) {
	var element = document.getElementById(id);
	var price = parseFloat(element.getElementsByClassName("price")[0].innerHTML);
	var quantity = element.getElementsByClassName("quantity")[0].firstChild.value;
	
	// make the cost box equal the price * quantity
	element.getElementsByClassName("cost")[0].firstChild.value = setValue(price * quantity);
	updateCosts();
}

function updateCosts() {
	// the base cost of all the items ordered (i.e. total before vat)
	var totalItems = sumNodeList(document.getElementsByClassName("quantity"));
	var baseCost = sumNodeList(document.getElementsByClassName("cost"));

	var vat = baseCost * 0.2;
	var subtotal = baseCost + vat;
	var deliveryCharge = baseCost >= 250 ? 0 : totalItems * 1.5;
	var total = subtotal + deliveryCharge;
	
	document.getElementById("vat_box").value = setValue(vat);
	document.getElementById("subtotal_box").value = setValue(subtotal);
	document.getElementById("delivery_box").value = setValue(deliveryCharge);
	document.getElementById("total_cost_box").value = setValue(total);
}

function sumNodeList(nodeList) {
	var total = 0;
	for (var i = 0; i < nodeList.length; i++) {
		total += Number(nodeList[i].firstChild.value);
	}
	return total;
}

function setValue(value) {
	return value == 0 ? "" : value.toFixed(2)
}


function validateForm() {
	var paymentMethod = document.getElementById("payment_select").value;
	var cardFirstDigit = document.getElementById("card_number_box").value.charAt(0);

	if (paymentMethod == "amex" && cardFirstDigit != 3) {
		return cardError("Amex", 3);
	} else if (paymentMethod == "visa" && cardFirstDigit != 4) {
		return cardError("Visa", 4);
	} else if (paymentMethod == "mastercard" && cardFirstDigit != 5) {
		return cardError("Mastercard", 5);
	} else {
		return true;
	}

	function cardError(cardName, digit) {
		alert(cardName + " cards must begin with a " + digit + " not " + cardFirstDigit);
		return false;
	}
}
