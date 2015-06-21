( function(){
	'use strict';

	var DAYS_OF_THE_WEEK = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var MONTHS_OF_THE_YEAR = ['January','February','March','April','May','June','July','August','September','October','November','December'];

	function renderTemplate( id, variables ){
		var template = document.getElementById( id ).textContent;
		if( !template ){
			return '';
		}
		var parsed_template = template.replace( /%([^% ]+)%/gi, function( match, tag_name ){
			return variables[tag_name] || '';
		} );
		return parsed_template;
	}

	function getStartOfToday(){
		var now = new Date();
		return new Date( now.getFullYear(), now.getMonth(), now.getDate() );
	}

	function getDaysUntil( date ){
		var now_timecode = getStartOfToday();
		var then_timecode = date.getTime();
		var difference = then_timecode - now_timecode;
		return Math.floor( difference / ( 24 * 60 * 60 * 1000 ) );
	}

	window.handleNextOuting = function( next_outing ){
		var outing_info_container = document.getElementById( 'outing-info' );
		if( !next_outing ){
			outing_info_container.innerHTML = renderTemplate( 'tmpl-outing-none', {} );
			return;
		}
		var outing_date = new Date( next_outing['date'] );
		var days_until_outing = getDaysUntil( outing_date );
		outing_info_container.innerHTML = renderTemplate( 'tmpl-outing', {
			'event': next_outing['event'],
			'location': next_outing['location'],
			'date': DAYS_OF_THE_WEEK[outing_date.getDay()] + ', ' + outing_date.getDate() + ' ' + MONTHS_OF_THE_YEAR[outing_date.getMonth()],
			'time_until': days_until_outing > 0 ? days_until_outing > 1 ? days_until_outing.toString() + ' days' : 'Tomorrow' : 'Today'
		} );
	};

	window.handleMenu = function( menu ){
		var menu_container = document.getElementById( 'menu' );
		var list_contents = '';
		for( var i = 0, d; d = ['monday','tuesday','wednesday','thursday','friday'][i]; i += 1 ){
			list_contents += renderTemplate( 'tmpl-menu', {
				'day': ['Mo','Tu','We','Th','Fr'][i],
				'meal': menu[d],
				'className': i === ( new Date().getDay() - 1 ) ? 'today' : ''
			} );
		}
		menu_container.innerHTML = list_contents;
	};

	window.handleNextBirthday = function( dudes ){
		if( dudes.length === 0 ){
			return;
		}
		var next_birthday_container = document.getElementById( 'next-birthday' );
		var next_birthday = Infinity;
		var next_birthday_name = '';
		var today = getStartOfToday();
		var next_year = new Date( today.getFullYear() + 1, 0, 1 );
		for( var i = 0; i < dudes.length; i += 1 ){
			var birth_date = new Date( today.getFullYear(), dudes[i]['birthday_month'] - 1, dudes[i]['birthday_day'] );
			if( birth_date >= today && birth_date < next_birthday ){
				next_birthday = birth_date;
				next_birthday_name = dudes[i]['name'];
			}
		}
		if( next_birthday === Infinity ){ // No birthdays in remainder of year, restart check from next January
			for( var i = 0; i < dudes.length; i += 1 ){
				var birth_date = new Date( today.getFullYear() + 1, dudes[i]['birthday_month'] - 1, dudes[i]['birthday_day'] );
				if( birth_date >= next_year && birth_date < next_birthday ){
					next_birthday = birth_date;
					next_birthday_name = dudes[i]['name'];
				}
			}
		}
		var days_until_birthday = getDaysUntil( next_birthday );
		next_birthday_container.innerHTML = renderTemplate( 'tmpl-next-birthday', {
			'name': next_birthday_name,
			'date': DAYS_OF_THE_WEEK[next_birthday.getDay()] + ', ' + next_birthday.getDate() + ' ' + MONTHS_OF_THE_YEAR[next_birthday.getMonth()],
			'time_until': days_until_birthday > 0 ? days_until_birthday > 1 ? days_until_birthday.toString() + ' days' : 'Tomorrow!' : 'Happy Birthday ' + next_birthday_name + '!'
		} );
	};

	// BEGIN NOTEPAD

	function refreshNotepad(){

		ajax( {
			type: 'GET',
			url: 'api/notepad',
			timeout: 5000,
			onSuccess: function( data ){
				console.log( 'Get successful - data returned: ' + data );
				updateNotesFromArray( JSON.parse( data ) );
			},
			onError: function(){
				console.log( 'Get failed' );
			}
		} );

	}

	function updateNotesFromArray( notes ){

		var notepad_container = document.getElementById( 'notepad' );
		var list_contents = '';
		for( var i = 0; i < notes.length; i += 1 ){
			list_contents += renderTemplate( notes[i]['url'] ? 'tmpl-note-with-link' : 'tmpl-note', {
				'id': notes[i]['id'],
				'text': notes[i]['text'],
				'url': notes[i]['url']
			} );
		}
		notepad_container.innerHTML = list_contents;

		var notepad_deletes = notepad_container.getElementsByTagName( 'form' );
		for( var i = 0; i < notepad_deletes.length; i += 1 ){
			notepad_deletes[i].addEventListener( 'submit', ( function( notepad_delete ){
				return function( event ){
					event.preventDefault();
					ajax( {
						type: 'DELETE',
						url: notepad_delete.action,
						timeout: 5000,
						onSuccess: function(){
							console.log( 'Delete successful' );
							refreshNotepad();
						},
						onError: function(){
							console.log( 'Delete failed' );
						}
					} );
				}
			} )( notepad_deletes[i] ), false );
		}

	}

	( function(){

		var notepad_add = document.getElementById( 'notepad-add' );
		notepad_add.addEventListener( 'submit', function( event ){
			event.preventDefault();
			ajax( {
				type: 'PUT',
				url: notepad_add.action,
				data: {
					text: document.getElementsByName( 'item_text' )[0].value,
					url: document.getElementsByName( 'item_url' )[0].value
				},
				timeout: 5000,
				onSuccess: function( data ){
					console.log( 'Put successful - data returned: ' + data );
					refreshNotepad();
				},
				onError: function(){
					console.log( 'Put failed' );
				}
			} );
		}, false );

		refreshNotepad();

	} )();

	// END NOTEPAD

	window.handleDebts = function( debts ){
		var debts_container = document.getElementById( 'debts' );
		var list_contents = '';
		for( var i = 0; i < debts.length; i += 1 ){
			list_contents += renderTemplate( 'tmpl-debt', {
				'id': debts[i]['id'],
				'debtor': debts[i]['debtor_name'],
				'creditor': debts[i]['creditor_name'],
				'item': debts[i]['item']
			} );
		}
		debts_container.innerHTML = list_contents;
	};

	window.populateDebtCreator = function( dudes ){
		var debtors_container = document.getElementById( 'debts-debtors' );
		var creditors_container = document.getElementById( 'debts-creditors' );
		var list_contents = '';
		for( var i = 0; i < dudes.length; i += 1 ){
			list_contents += renderTemplate( 'tmpl-debt-people', {
				'id': dudes[i]['id'],
				'name': dudes[i]['name']
			} );
		}
		debtors_container.innerHTML += list_contents;
		creditors_container.innerHTML += list_contents;
	};

	// BEGIN SHOPPING LIST

	function refreshShoppingList(){
		ajax( {
			type: 'GET',
			url: 'api/shopping-list',
			timeout: 5000,
			onSuccess: function( data ){
				console.log( 'Get successful - data returned: ' + data );
				updateShoppingListFromArray( JSON.parse( data ) );
			},
			onError: function(){
				console.log( 'Get failed' );
			}
		} );
	}

	function updateShoppingListFromArray( items ){

		var shopping_list_container = document.getElementById( 'shopping-list' );
		var list_contents = '';
		for( var i = 0; i < items.length; i += 1 ){
			list_contents += renderTemplate( 'tmpl-shopping-list', {
				'name': items[i]['name'],
				'id': items[i]['id']
			} );
		}
		shopping_list_container.innerHTML = list_contents;

		var shopping_list_deletes = shopping_list_container.getElementsByTagName( 'form' );
		for( var i = 0; i < shopping_list_deletes.length; i += 1 ){
			shopping_list_deletes[i].addEventListener( 'submit', ( function( shopping_list_delete ){
				return function( event ){
					event.preventDefault();
					ajax( {
						type: 'DELETE',
						url: shopping_list_delete.action,
						timeout: 5000,
						onSuccess: function(){
							console.log( 'Delete successful' );
							refreshShoppingList();
						},
						onError: function(){
							console.log( 'Delete failed' );
						}
					} );
				}
			} )( shopping_list_deletes[i] ), false );
		}

	}

	( function(){

		var shopping_list_add = document.getElementById( 'shopping-list-add' );
		shopping_list_add.addEventListener( 'submit', function( event ){
			event.preventDefault();
			ajax( {
				type: 'PUT',
				url: shopping_list_add.action,
				data: {
					name: document.getElementsByName( 'item_name' )[0].value,
				},
				timeout: 5000,
				onSuccess: function( data ){
					console.log( 'Put successful - data returned: ' + data );
					refreshShoppingList();
				},
				onError: function(){
					console.log( 'Put failed' );
				}
			} );
		}, false );

		refreshShoppingList();

	} )();

	// END SHOPPING LIST

	// BEGIN TEN4 ROULETTE

	( function(){

		function Ten4Roulette( roulette_container, spin_button ){

			var all_people = roulette_container.querySelectorAll( 'li' );
			var endpoints = {
				tea: 'api/tea-roulette',
				washingUp: 'api/washing-up-roulette',
			};

			setUpSpinner();

			function getNames( people ){
				var dude_names = [];
				for( var i = 0; i < people.length; i += 1 ){
					dude_names.push( people[i].getAttribute( 'data-person-name' ) );
				}
				return dude_names;
			}

			function LinearPersonHighlighter( people ){
				var i = Math.floor( Math.random() * people.length );
				return function(){
					var next_person = people[i];
					resetPeople();
					classie.addClass( next_person, 'active' );
					i += 1;
					i = i % people.length;
				};
			}

			function setUpSpinner(){
				spin_button.addEventListener( 'click', function(){
					spinWheel();
				}, false );
			}

			function getParticipants(){
				var non_absentees = [];
				for( var i = 0; i < all_people.length; i += 1 ){
					if( all_people[i].querySelector( 'input' ).checked ){
						non_absentees.push( all_people[i] );
					}
				}
				return non_absentees;
			}

			function displayResult( loser_name ){
				for( var i = 0; i < all_people.length; i += 1 ){
					classie.removeClass( all_people[i], 'active' );
					if( all_people[i].getAttribute( 'data-person-name' ) === loser_name ){
						classie.addClass( all_people[i], 'loser' );
						continue;
					}
					classie.addClass( all_people[i], 'winner' );
				}
			}

			function resetPeople(){
				for( var i = 0; i < all_people.length; i += 1 ){
					classie.removeClass( all_people[i], 'active' );
					classie.removeClass( all_people[i], 'loser' );
					classie.removeClass( all_people[i], 'winner' );
				}
			}

			function resetWheel(){
				resetPeople();
				classie.removeClass( roulette_container, 'spinning' );
				classie.removeClass( spin_button, 'hidden' );
			}

			function spinWheel(){
				var participants = getParticipants( document.querySelectorAll( '#ten4-roulette li' ) );
				if( participants.length < 2 ){
					alert( "Don't be a dingus" );
					return;
				}
				var rouletteType = document.getElementById( 'ten4-roulette-type' ).value;
				var highlightNextPerson = new LinearPersonHighlighter( participants );
				var spinning = true;
				var ticks = 0;
				var tick = function(){
					window.setTimeout( function(){
						if( !spinning ){
							return;
						}
						highlightNextPerson();
						ticks += 1;
						window.webkitRequestAnimationFrame( tick );
					}, 70 );
				};
				classie.addClass( roulette_container, 'spinning' );
				classie.addClass( spin_button, 'hidden' );
				tick();
				ajax( {
					type: 'POST',
					url: endpoints[rouletteType],
					timeout: 15000,
					data: {
						names: getNames( participants )
					},
					onSuccess: function( data ){
						console.log( 'Ten4 Roulette successful - data returned: ' + data );
						spinning = false;
						var data_object = JSON.parse( data );
						displayResult( data_object.name );
						window.setTimeout( function(){
							resetWheel();
						}, 3000 );
					},
					onError: function(){
						console.log( 'Ten4 Roulette failed' );
					}
				} );
			}

		}

		new Ten4Roulette( document.getElementById( 'ten4-roulette' ), document.getElementById( 'ten4-roulette-spin' ) );

	} )();

	// END TEN4 ROULETTE

	// BEGIN TEN4 SAYS

	( function(){

		var ten4_says = document.getElementById( 'ten4-says' );

		ten4_says.addEventListener( 'submit', function( event ){
			event.preventDefault();
			var message_input = document.getElementById( 'ten4-says-phrase' );
			if( message_input.value.length === 0 ){
				return;
			}
			ajax( {
				type: ten4_says.method,
				url: ten4_says.action,
				data: {
					message: message_input.value
				},
				onSuccess: function( data ){
					console.log( 'Ten4 Says successful - data returned: ' + data );
				},
				onError: function(){
					console.log( 'Ten4 Says failed' );
				}
			} );
			message_input.value = '';
		}, false );

	} )();

	// END TEN4 SAYS

	// BEGIN DING

	( function(){

		var ding = document.getElementById( 'ding' );

		ding.addEventListener( 'submit', function( event ){
			event.preventDefault();
			var ding_count = document.getElementById( 'ding-type' );
			ajax( {
				type: ding.method,
				url: ding.action,
				data: {
					ding_count: ding_count.value
				},
				onSuccess: function( data ){
					console.log( 'Ding successful' );
				},
				onError: function(){
					console.log( 'Ding failed' );
				}
			} );
		}, false );

	} )();

	// END DING

	window.handleWashingUpRota = function( ordered_dudes ){
		var rota_container = document.getElementById( 'washing-up-rota' );
		var list_contents = '';
		for( var i = 0; i < ordered_dudes.length; i += 1 ){
			list_contents += renderTemplate( 'tmpl-washing-up-row', {
				'name': ordered_dudes[i]
			} );
		}
		rota_container.innerHTML += list_contents;
	};

	function notifySlack( message, username, channel, icon_url ){
		if( !message ){
			return;
		}
		var payload = {};
		payload.text = message;
		if( username ){
			payload.username = username;
		}
		if( channel ){
			payload.channel = '#' + channel;
		}
		if( icon_url ){
			payload.icon_url = icon_url;
		}
		window.ajax( {
			url: 'api/slack-notify/',
			data: {
				payload: JSON.stringify( payload )
			},
			headers: [
				['Content-Type', 'application/x-www-form-urlencoded']
			],
			timeout: 5000,
			onSuccess: function( data ){
				console.log( 'Sent "' + message + '" to Slack' );
			},
			onError: function(){
				console.log( 'Could not send "' + message + '" to Slack' );
				console.log( 'Payload: ' + JSON.stringify( payload ) );
			}
		} );
	}

	function DashboardThemeManager(){

		var themes = {};

		function addTheme( theme_id, toggle_button_id, background_function ){
			themes[theme_id] = {
				enabled: false,
				background_function: background_function
			};
			document.getElementById( toggle_button_id ).addEventListener( 'click', function(){
				toggleTheme( theme_id );
			}, false );
		}

		function clearThemes(){
			BACKGROUND_CANVAS.resetDrawFunction();
			for( var theme in themes ){
				if( themes.hasOwnProperty( theme ) ){
					themes[theme].enabled = false;
					document.body.classList.remove( theme );
				}
			}
		}

		function toggleTheme( theme_id ){
			var was_enabled = themes[theme_id].enabled;
			clearThemes();
			if( !was_enabled ){
				themes[theme_id].enabled = true;
				document.body.classList.add( theme_id );
				BACKGROUND_CANVAS.updateDrawFunction( themes[theme_id].background_function );
			}
		}

		return {
			addTheme: addTheme,
			toggleTheme: toggleTheme
		};

	}

	function BackgroundCanvas( canvas_id ){

		window.requestAnimFrame = ( function(){
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function( callback, element ){
				return window.setTimeout( callback, 1000 / 60 );
			};
		} )();

		window.cancelRequestAnimFrame = ( function() {
				return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout
		} )();

		var canvas = document.getElementById( canvas_id );
		var pen = canvas.getContext( '2d' );
		var draw = null;
		var animation_frame_request = null;
		stretch();
		resetDrawFunction();

		function stretch(){
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}

		function clearCanvas(){
			pen.clearRect( 0, 0, canvas.width, canvas.height );
		}

		function resetDrawFunction(){
			if( animation_frame_request ){
				cancelRequestAnimFrame( animation_frame_request );
				animation_frame_request = null;
			}
			draw = function(){};
			clearCanvas();
		}

		function updateDrawFunction( create ){
			if( typeof create !== 'function' ){
				return;
			}
			var func = create( canvas, pen );
			draw = function(){
				func();
				animation_frame_request = window.requestAnimFrame( draw, canvas );
			};
			clearCanvas();
			draw();
		}

		return {
			stretch: stretch,
			updateDrawFunction: updateDrawFunction,
			resetDrawFunction: resetDrawFunction
		};

	}

	var BACKGROUND_CANVAS = new BackgroundCanvas( 'background-canvas' );
	var THEME_MANAGER = new DashboardThemeManager();
	THEME_MANAGER.addTheme( 'hacker', 'hacker-button', window.DRAW_FUNCTIONS.hacker );
	THEME_MANAGER.addTheme( 'cat', 'cat-button', window.DRAW_FUNCTIONS.cat );
	THEME_MANAGER.addTheme( 'pirate', 'pirate-button' );
	THEME_MANAGER.addTheme( 'xmas', 'xmas-button', window.DRAW_FUNCTIONS.xmas );

	window.addEventListener( 'resize', function(){
		BACKGROUND_CANVAS.stretch();
	}, false );

	var current_month = ( new Date ).getMonth();
	if( current_month === 11 ){
		THEME_MANAGER.toggleTheme( 'xmas' );
	}

	document.querySelector( '#todays-gif-show button' ).addEventListener( 'click', function(){
		var todays_gif_show = document.getElementById( 'todays-gif-show' );
		var todays_gif_img = document.getElementById( 'todays-gif-img' );
		todays_gif_show.className =  todays_gif_show.className += 'removed';
		todays_gif_img.className =  todays_gif_img.className.replace( /(?:^|\s)removed(?!\S)/gi, '' );
	}, false );

} )();
