chicoTest = null;
chicoTest = setInterval(function() {
	var now = new Date();
	if (now.getHours() == 17 && now.getMinutes() == 15) {
		document.body.innerHTML += "<div class='ui chico1 modal'><div class='header'>What time is it?</div><div class='actions'><div class='two fluid ui buttons'><div class='ui ok positive button'>Don't know...</div><div class='ui cancel negative button'>Don't care.</div></div></div></div>";

		document.body.innerHTML += "<div class='ui chico2 modal'><div class='content'><div class='ui chico embed' data-source='youtube' data-id='O_-isKzt4O4'></div></div><div class='actions'><div class='ui cancel negative button'>No more chico.</div></div></div>";

		$('.chico1.modal .chico2.modal').modal({
			allowMultiple: false
		});

		$('.chico2.modal').modal({
			onShow: function() {
				$('.chico.embed').embed({autoplay: true});
				dropChicos();
			},
			onHide: function() {
				$('.chico.embed').embed();
				stopChicos();
			}
		}).modal(
			'attach events', '.chico1.modal .ok.button'
		);

		$('.chico1.modal').modal({
			onApprove: function() {
				ga('send', {
			      hitType: 'event',
			      eventCategory: 'Eastereggs',
			      eventAction: 'play',
			      eventLabel: 'ChicoTime'
			    });
			},
			onDeny: function() {
				ga('send', {
			      hitType: 'event',
			      eventCategory: 'Eastereggs',
			      eventAction: 'ignore',
			      eventLabel: 'ChicoTime'
			    });
			}
		}).modal('show');
		clearInterval(chicoTest)
	}
}.bind(chicoTest), 10000);

dropChicos = function() {
	chicoContainer = document.createElement('div');
	chicoContainer.id = "chicoContainer";
	document.body.appendChild(chicoContainer);
    var container = document.getElementById('chicoContainer');
    for (var i = 0; i < 40; i++)
    {
        container.appendChild(createAChico());
    }
}

stopChicos = function() {
	document.body.removeChild(document.getElementById("chicoContainer"));
}

function randomInteger(low, high)
{
    return low + Math.floor(Math.random() * (high - low));
}

function randomFloat(low, high)
{
    return low + Math.random() * (high - low);
}

function pixelValue(value)
{
    return value + 'px';
}


function durationValue(value)
{
    return value + 's';
}


function createAChico()
{
    var chicoDiv = document.createElement('div');
    var image = document.createElement('img');

    /* Randomly choose a leaf image and assign it to the newly created element */
    image.src = "/chico/chico.png";

    chicoDiv.style.top = "-100px";

    /* Position the leaf at a random location along the screen */
    chicoDiv.style.left = pixelValue(randomInteger(0, window.innerWidth));

    /* Randomly choose a spin animation */
    var spinAnimationName = 'clockwiseSpin';

    /* Set the -webkit-animation-name property with these values */
    chicoDiv.style.animationName = 'fade, drop';
    image.style.animationName = spinAnimationName;

    /* Figure out a random duration for the fade and drop animations */
    var fadeAndDropDuration = durationValue(randomFloat(5, 11));

    /* Figure out another random duration for the spin animation */
    var spinDuration = durationValue(randomFloat(4, 8));
    /* Set the -webkit-animation-duration property with these values */
    chicoDiv.style.animationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;

    var chicoDelay = durationValue(randomFloat(0, 5));
    chicoDiv.style.animationDelay = chicoDelay + ', ' + chicoDelay;

    image.style.animationDuration = spinDuration;

    // add the <img> to the <div>
    chicoDiv.appendChild(image);

    /* Return this img element so it can be added to the document */
    return chicoDiv;
}