enchant();

var GAME_FRAME_WIDTH = 320;
var GAME_FRAME_HEIGHT = 320;
var SPACE_KEY_CODE = 32;
var B_KEY_CODE = 66;
var PLAYER_ICON = 'player.png';
var BOMB_ICON = 'player.png';
var FPS = 32;

$(document).ready(function(){
	var gameover = false;

	var game = new Game(GAME_FRAME_WIDTH, GAME_FRAME_HEIGHT);
	game.fps = FPS;
	game.preload(PLAYER_ICON);
	game.preload(BOMB_ICON);
	game.rootScene.backgroundColor = '#f5deb3';

	// Bomb
	var Bomb = Class.create(Sprite, {

		initialize : function(x, y) {
			var width  = 32;
			var height = 32;
			Sprite.call(this, width, height);

			this.image = game.assets[BOMB_ICON];
			this.x = x;
			this.y = y;

			this.addEventListener(enchant.Event.ENTER_FRAME, function(){
			});
			game.rootScene.addChild(this);
		},
		
		explode : function() {
			
		}
	});

	var Avator = Class.create(Sprite, {
		initialize : function(width, height, icon, speed) {
			Sprite.call(this, width, height);

			// Override
			this.image   = game.assets[icon];
			this._speed = speed;
		},

		nearby : function(avator) {
			if ( ! avator instanceof Sprite ) {
				return false;
			}
			var shorterEdge = (this.width > this.height) ? this.height : this.width;
			var radius =  shorterEdge / 2;

			return avator.within(this, radius);
		}
	});

	// Player
	var Player = Class.create(Avator, {
		
		initialize : function() {

			var width  = 32;
			var height = 32;
			var speed  = 5;
			Avator.call(this, width, height, PLAYER_ICON, speed);

			this.x = (GAME_FRAME_WIDTH  - this.width)  / 2;
			this.y = (GAME_FRAME_HEIGHT - this.height) / 2;

			// set event
			this.addEventListener(enchant.Event.ENTER_FRAME, function() {

				// moveing
				if(game.input.left  && !game.input.up   && !game.input.down)  {
					this.x -= (this.x < 0) ? 0 : this._speed;
				}

				if(game.input.right && !game.input.up   && !game.input.down)  {
					this.x += (this.x > GAME_FRAME_WIDTH - this.width) ? 0 : this._speed;
				}

				if(game.input.up    && !game.input.left && !game.input.right) {
					this.y -= (this.y < 0) ? 0 : this._speed;
				}

				if(game.input.down  && !game.input.left && !game.input.right) {
					this.y += (this.y > GAME_FRAME_HEIGHT - this.height) ? 0 : this._speed;
				}
			});

			var self = this;
			game.rootScene.addEventListener('touchstart' , function(event){
				var bomb = new Bomb(self.x, self.y);
			});
		},

	});

	var Enemy = Class.create(Avator, {
		initialize : function() {
			var width  = 32;
			var height = 32;
			var speed = 0.3;
			Avator.call(this, width, height, PLAYER_ICON, speed);


			// Disapear from display edges
			// direction :
			//  1 : upside
			//  2 : rightside
			//  3 : downside
			//  4 : leftside
			var direction = parseInt(Math.random() * 10 / 4);

			var position = 0;
			if (direction === 1) { // upside
				position = parseInt(Math.random() * GAME_FRAME_WIDTH);
				this.x = position;
				this.y = 0;
			} else if (direction === 2) { // rightside
				position = parseInt(Math.random() * GAME_FRAME_HEIGHT);
				this.x = GAME_FRAME_WIDTH - this.width;
				this.y = position;
			} else if (direction === 3) { // downside
				position = parseInt(Math.random() * GAME_FRAME_WIDTH);
				this.x = position;
				this.y = GAME_FRAME_HEIGHT - this.height;
			} else { // leftside
				position = parseInt(Math.random() * GAME_FRAME_HEIGHT);
				this.x = 0;
				this.y = position;
			}
		}
	});

	game.onload = function() {
		// Playser settings
		var player = new Player();
		var enemyList = [];
		var withinEnemy = function(sprite) {
			if(sprite instanceof Sprite) {
				return false;
			}

			var within = false;
			for(var key in enemyList) {
				if(enemyList[key].nearby(sprite)) {
					within = true;
					break;
				}
			}
			return within;
		}
		var root = this.rootScene;
		root.addChild(player);
		root.addEventListener(enchant.Event.ENTER_FRAME, function(){
			// apear Enemy
			var now = (new Date()).getTime();
			if(now % 60 === 0) {
				var enemy = new Enemy();

				// Enemy movment
				enemy.addEventListener(enchant.Event.ENTER_FRAME, function(){
					var vect_x = (player.x - this.x) > 0 ? 1 : -1;
					var vect_y = (player.y - this.y) > 0 ? 1 : -1;

//                    this.x += vect_x * ( withinEnemy(this) ? 0 : this._speed );
//                    this.y += vect_y * ( withinEnemy(this) ? 0 : this._speed );
					this.x += vect_x * this._speed;
					this.y += vect_y * this._speed;

					// if Enemy touched player
					if(player.nearby(this)) {
						alert("Game Over !!!");
						game.stop();
					}
				});

				root.addChild(this);
				enemyList.push(this);
			}
		});
	};


	game.start();
});


