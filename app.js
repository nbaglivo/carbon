"use strict";

var fuelFactor = {
	'naphtha': 2.37,
	'diesel': 2.77,
	'gnc': 1.95
}

var valuesNames = {
	'#distance-input': 'Distancia debe ser un n&uacutemero',
	'#efficiency-input': 'Eficiencia debe ser un n&uacutemero',
	'#transportation-occupants-input': 'N&uacutemero de ocupantes'
}

function isNumeric(num){
	return !isNaN(num);
}

function check(field) {
	var value = $(field).val();
	if (isNumeric(value) && value !== '') {
		return true;
	} else {
		if (value !== '') {
			warn(valuesNames[field] + ' debe ser un n&uacutemero');
		}
		return false;
	}
}

function checkAll() {
	if (check('#distance-input') && check('#transportation-occupants-input') && check('#efficiency-input')) {
		showResult();
	}
}

function busCO2() {
	return $('#distance-input').val() * fuelFactor['diesel'] * 0.6 / 2000;
}

function carCO2() {
	var distance = $('#distance-input').val();
	var efficiency = $('#efficiency-input').val();
	var occupants = $('#transportation-occupants-input').val();
	var fuel = fuelFactor[$('#fueltype-select').val()];
	// (B9*2.37*(1/B11))/1000)*B5
	return ((distance * fuel * (1/efficiency)) / 1000) / occupants;
}

function getCO2() {
	var transportation = $('#transportation-select').val();
	if (transportation === 'bus') {
		return busCO2();
	} else {
		return carCO2();
	}
}

function refreshFootprint() {
	var footprint = localStorage.getItem("footprint");

	if (!footprint) {
		footprint = 0;
		var d = new Date();
		var start = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
		localStorage.setItem("start", start);
		localStorage.setItem("footprint", footprint);
	}

	$('#footprint-value').html(footprint + ' toneladas de CO2 desde el ' + localStorage.getItem("start"));
}

function showResult() {	
	$('#result-txt').html('Este viaje te sumar&aacute '+ getCO2() +' toneladas de CO2 a tu consciencia &#191Podr&aacutes soportarlo?');
	$('#result-buttons').removeClass('hide');
}

function resetCO2() {
	localStorage.removeItem("footprint");
	refreshFootprint();
	reset();
	$('#nativeMenu').modal('hide');
}

function showAbout() {
	$('#about').removeClass('hide');
	$('#calculator').addClass('hide');
	$('#nativeMenu').modal('hide');
}

function showCalculator() {
	$('#calculator').removeClass('hide');
	$('#about').addClass('hide');
	$('#nativeMenu').modal('hide');
}

function save() {
	var val = parseInt(localStorage.getItem("footprint")) + getCO2();
	localStorage.setItem("footprint", val);
	refreshFootprint();
	reset();
}

function resetInputs() {
	$('#distance-input').val('');
	$('#efficiency-input').val('');
	$('#transportation-occupants-input').val('');

	$('#result-buttons').addClass('hide');
}

function reset(value) {
	$('#transportation-select').val(value || 'foot');
	$('#fueltype').addClass('hide');
	$('#distance').addClass('hide');
	$('#efficiency').addClass('hide');
	$('#transportation-occupants').addClass('hide');

	resetInputs();

	$('#result').removeClass('alert-danger');
	$('#result').addClass('alert-success');
	$('#result-txt').html('&#161Buen viaje!');
}

function warn(txt) {
	$('#result').addClass('alert-danger');
	$('#result-txt').html(txt || 'Pensalo bien...');
}

window.onload = function() {
	refreshFootprint();

	var shown = false;
	$('.navbar-brand').click(function(e) {
		$('#nativeMenu').modal('toggle');
	});

	$('#nativeMenu').on('show.bs.modal', function (e) {
		$('.btn-navbar').addClass('selected');
	});

	$('#nativeMenu').on('hide.bs.modal', function (e) {
		$('.btn-navbar').removeClass('selected');
	});

	$('#transportation-select').on('change', function() {
		var value = $(this).val();
		if (value === 'foot' || value === 'bicycle') {
			reset(value);
		} else if (value === 'car' ) {
			resetInputs();

			$('#fueltype').removeClass('hide');
			$('#distance').removeClass('hide');
			$('#efficiency').removeClass('hide');
			$('#transportation-occupants').removeClass('hide');

			warn();
		} else if (value === 'bus' ) {
			resetInputs();

			$('#distance').removeClass('hide');

			$('#fueltype').addClass('hide');
			$('#efficiency').addClass('hide');
			$('#transportation-occupants').addClass('hide');

			warn();
		}

	});

	$('#distance-input').on('change', function() {
		var transportation = $('#transportation-select').val();
		if (transportation === 'bus') {
			if (check('#distance-input')) {
				showResult();
			}
		} else if (transportation === 'car') {
			checkAll();
		}
	});

	$('#efficiency-input').on('change', checkAll);
	$('#transportation-occupants-input').on('change', checkAll);

}