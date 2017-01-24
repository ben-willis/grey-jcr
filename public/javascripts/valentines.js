var socket = io.connect('localhost:8081');

$('.green.help.icon').popup();
$('.sticky').sticky({offset: 10});

function updateTotal(addition) {
	currentTotal = $("#totalRaised").text().split(".");
	currentTotal = parseInt(currentTotal[0])*100 + parseInt(currentTotal[1]);
	currentTotal += addition
	$("#totalRaised").text(Math.floor(currentTotal/100) +'.'+ ('00'+currentTotal%100).slice(-2));
	$("#totalRaised").parent().transition("tada");
}

socket.on('message', function(data) {
	console.log(data)
})

// Recieve Swap
socket.on('swap', function(data) {
	// Find the two pairs
	pairA = $("[data-pair='"+data.paira+"']");
	pairB = $("[data-pair='"+data.pairb+"']");

	// Pulse them
	pairA.transition("pulse");
	pairB.transition("pulse");

	// Update their prices
	pairA.find(".price").text((Number(pairA.find('.price').first().text()) + 0.5).toFixed(2));
	pairB.find(".price").text((Number(pairB.find('.price').first().text()) + 0.5).toFixed(2));

	// Swap their labels
	pairAHTML = pairA.html();
	pairBHTML = pairB.html();
	pairA.html(pairBHTML);
	pairB.html(pairAHTML);

	// Add to the swap stream
	$(".ui.feed").prepend("<div class='event hidden'><div class='label'><i class='refresh icon'></i></div><div class='content'><div class='date'>"+(new Date()).toLocaleTimeString('en-US')+"</div>"+pairA.find('.lead').first().text()+" and "+pairA.find('.partner').first().text()+" were swapped with "+pairB.find('.lead').first().text()+" and "+pairB.find('.partner').first().text()+"</div></div>").children(".event:first").transition("fade in");

	// Update the total raised
	updateTotal(data.cost)
});

// Select Positions
$(".pair").on("click", function(e) {
	lock = true;
	// Set position A and B to be the values of the hidden inputs
	pairA = $('#pairA').val();
	pairB = $('#pairB').val();

	// The position selected is the data-position of the pair selected
	pairSelected = $(this).attr('data-pair');

	// If its the same as positionA 
	if (pairA == pairSelected) {
		// If position B is nothing deselect A
		if (pairB == "") {
			$('#pairA').val("");
			$("#swapA").text("Swap any pair...")
		} else {
			$('#pairA').val(pairB);
			$('#swapA').text($("[data-pair='"+pairB+"']").find('.lead').first().text() + " and " + $("[data-pair='"+pairB+"']").find('.partner').first().text());
			$('#pairB').val("");
			$('#swapB').text("...any other pair!")
		}
	// IF its positionB just deselect it
	} else if (pairB == pairSelected) {
		$('#pairB').val("");
		$('#swapB').text("...any other pair!");
	// If position A has no value we can set it to the pair selected
	} else if (pairA == "") {
		$('#pairA').val(pairSelected);
		$('#swapA').text($("[data-pair='"+pairSelected+"']").find('.lead').first().text() + " and " + $("[data-pair='"+pairSelected+"']").find('.partner').first().text());
	// Otherwise set position B to the selected pair
	} else {
		$('#pairB').val(pairSelected);
		$('#swapB').text($("[data-pair='"+pairSelected+"']").find('.lead').first().text() + " and " + $("[data-pair='"+pairSelected+"']").find('.partner').first().text());
	}

	// Get the valuse of the two positions
	pairA = $('#pairA').val();
	pairB = $('#pairB').val();

	// Make sure that they're active and no others are
	$(".pair.active").removeClass("active");
	$("[data-pair='"+pairA+"'] , [data-pair='"+pairB+"']").addClass("active");

	if (pairA == "" || pairB == "") {
		$(".swap.button").addClass("disabled");
	} else {
		$(".swap.button").removeClass("disabled");
	}
});

$(".search").on("change keyup paste mouseup", function (e) {
	search = $(this).val().toLowerCase();
	if (search == '') {
		$(".negative").removeClass("negative");
		return;
	}
	for (var i = 0; i < 128; i++) {
		pair = $("[data-position='"+i%totalSeats+"']")
		lead = pair.find('.lead').first().text().toLowerCase();
		partner = pair.find('.partner').first().text().toLowerCase();

		if (lead.indexOf(search) != -1 || partner.indexOf(search) != -1) {
			pair.addClass("negative");
		} else {
			pair.removeClass("negative");
		}
	};
});