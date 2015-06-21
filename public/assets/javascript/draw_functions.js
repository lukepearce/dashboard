
function Vector2D( x, y ){
	this.x = x;
	this.y = y;
}

Vector2D.prototype.add = function( vector ){
	this.x += vector.x;
	this.y += vector.y;
	return this;
};

Vector2D.prototype.limitX = function( limit ){
	if( this.x > limit ){
		this.x = limit;
	}
	else if( this.x < -limit ){
		this.x = -limit;
	}
	return this;
};

Vector2D.prototype.limitY = function( limit ){
	if( this.y > limit ){
		this.y = limit;
	}
	else if( this.y < -limit ){
		this.y = -limit;
	}
	return this;
};

Vector2D.prototype.mult = function( factor ){
	this.x *= factor;
	this.y *= factor;
	return this;
};

Vector2D.prototype.copy = function(){
	return new Vector2D( this.x, this.y );
};


window.DRAW_FUNCTIONS = {
	hacker: function( canvas, pen ){
		var character_pool = '且丕世丗丘丙可旦正㱒㱓㱔歪歫不丏丐丑丒丰互五卅𠀋';
		var characters = [];
		var grid_spacing_x = 16;
		var grid_spacing_y = 24;
		var next_frame_time = 0;
		pen.font = '16px monospace';
		for( var i = 0; i < 100; i += 1 ){
			characters[i] = {
				character: character_pool.substr( Math.floor( Math.random() * character_pool.length ), 1 ),
				x: Math.floor( Math.random() * ( canvas.width / grid_spacing_x ) ) * grid_spacing_x,
				y: Math.floor( Math.random() * ( canvas.height / grid_spacing_y ) ) * grid_spacing_y
			};
		}
		return function(){
			if( Date.now() < next_frame_time ){
				return;
			}
			pen.fillStyle = 'rgba(0,0,0,0.2)';
			pen.fillRect( 0, 0, canvas.width, canvas.height );
			pen.fillStyle = '#00ff00';
			for( var i = characters.length - 1; i >= 0; i -= 1 ){
				if( characters[i].y > canvas.height ){
					characters[i].y = 0;
					characters[i].x = Math.floor( Math.random() * ( canvas.width / grid_spacing_x ) ) * grid_spacing_x;
				}
				pen.fillText( characters[i].character, characters[i].x, characters[i].y );
				characters[i].character = character_pool.substr( Math.floor( Math.random() * character_pool.length ), 1 );
				characters[i].y += grid_spacing_y;
			}
			next_frame_time = Date.now() + 50;
		};
	},
	cat: function( canvas, pen ){
		var TAU = Math.PI * 2;
		var cat_face = new Image();
		var cat_face_2 = new Image();
		var cats = [];
		var serious_cat = {
			x: canvas.width - 180,
			y: canvas.height,
			watching: false,
			moving_down: false,
			moving_up: false
		};
		for( var i = 0; i < 60; i += 1 ){
			cats[i] = {
				angle: Math.random() * TAU,
				x: Math.floor( Math.random() * canvas.width ),
				y: Math.floor( Math.random() * canvas.height ),
				speed: Math.ceil( Math.random() * 4 )
			};
			if( Math.random() > 0.5 ){
				cats[i].speed = -cats[i].speed;
			}
		}
		cat_face.src = 'assets/images/cat-face.png';
		cat_face_2.src = 'assets/images/cat-face-2.png';
		return function(){
			pen.clearRect( 0, 0, canvas.width, canvas.height );
			for( var i = cats.length - 1; i >= 0; i -= 1 ){
				if( cats[i].x > canvas.width + 40 ){
					cats[i].x = -40;
				}
				if( cats[i].x < -40 ){
					cats[i].x = canvas.width + 40;
				}
				cats[i].angle += 0.1;
				cats[i].angle %= TAU;
				cats[i].x += cats[i].speed;
				pen.save();
				pen.translate( cats[i].x, cats[i].y );
				pen.rotate( cats[i].angle );
				pen.drawImage( cat_face, -40, -40, 80, 80 );
				pen.restore();
			}
			if( !serious_cat.moving_down && !serious_cat.moving_up ){
				if( serious_cat.watching ){
					if( Math.random() < 0.005 ){
						serious_cat.moving_down = true;
						serious_cat.watching = false;
					}
				}
				else{
					if( Math.random() < 0.005 ){
						serious_cat.moving_up = true;
						serious_cat.watching = false;
					}
				}
			}
			else if( serious_cat.moving_down ){
				serious_cat.y += 1;
				if( serious_cat.y >= canvas.height ){
					serious_cat.moving_down = false;
				}
			}
			else if( serious_cat.moving_up ){
				serious_cat.y -= 1;
				if( serious_cat.y <= canvas.height - 120 ){
					serious_cat.moving_up = false;
					serious_cat.watching = true;
				}
			}
			pen.save();
			pen.translate( serious_cat.x, serious_cat.y );
			pen.drawImage( cat_face_2, 0, 0, 120, 120 );
			pen.restore();
		};
	},
	xmas: function( canvas, pen ){
		var snowflakes = [];
		var gravity = new Vector2D( 0, 0.2 );
		var wind = new Vector2D( 0, 0 );
		var TAU = Math.PI * 2;
		for( var i = 0; i < 300; i += 1 ){
			snowflakes[i] = {
				pos: new Vector2D( Math.round( Math.random() * canvas.width ), Math.round( Math.random() * canvas.height ) ),
				acc: new Vector2D( 0, 0 ),
				size: ( Math.random() * 0.6 ) + 0.4
			};
		}
		return function(){
			pen.fillStyle = 'rgba(255,255,255,0.8)';
			pen.clearRect( 0, 0, canvas.width, canvas.height );
			wind.add( new Vector2D( ( Math.random() * 0.01 ) - 0.005, 0 ) ).limitX( 0.2 );
			for( var i = 0; i < snowflakes.length; i += 1 ){
				snowflakes[i].acc.add( gravity.copy().mult( snowflakes[i].size ) ).add( wind.copy().mult( snowflakes[i].size ) ).limitY( snowflakes[i].size * 3 ).limitX( snowflakes[i].size * 5 );
				snowflakes[i].pos.add( snowflakes[i].acc );
			//	pen.fillRect( snowflakes[i].pos.x, snowflakes[i].pos.y, 4, 4 );
				pen.beginPath();
				pen.arc( snowflakes[i].pos.x, snowflakes[i].pos.y, Math.ceil( snowflakes[i].size * 3 ), 0, TAU, false );
				pen.closePath();
				pen.fill();
				if( snowflakes[i].pos.y > canvas.height ){
					snowflakes[i].pos.y = 0;
				}
				else if( snowflakes[i].pos.y < 0 ){
					snowflakes[i].pos.y = canvas.height;
				}
				if( snowflakes[i].pos.x > canvas.width ){
					snowflakes[i].pos.x = 0;
				}
				else if( snowflakes[i].pos.x < 0 ){
					snowflakes[i].pos.x = canvas.width;
				}
			}
		};
	}
};