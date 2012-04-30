enchant();

// Length Definitions
var GAME_FRAME_WIDTH  = 320;
var GAME_FRAME_HEIGHT = 320;

// Key code Definitions
var SPACE_KEY_CODE    = 32;
var B_KEY_CODE        = 66;

// Image Definitions
var PLAYER_ICON       = './images/player.png';
var BOMB_ICON         = './images/bomb.png';
var BLAST_IMAGE       = './images/blast.png';

// Time Definitions
var GAME_TIME         = 60;
var EXPLORD_TIME      = 2;
var BLAST_TIME        = 1;
var SET_BOMB_INTERVAL = 0.75;

// DebugMode
var DEBUG = false;

// Sentence Constants
var PREFIX_TIMER = "Time : ";
var PREFIX_SCORE = "Score : ";

// Others
var SCREEN_BACKGROUND_COLOR = '#f5deb3';
var FPS = 32;
var SCORE_PER_ENEMY_BASE = 5;

// enemy appear ratio (per 10 seconds)
var ENEMY_OCCURRENCE_RATIO = 6;

// Max Level
var MAX_LEVEL = 8;

// Entity
var player = null;
var enemyList = [];
var bombList = [];

// Labels
var scoreLabel = null;
var timerLabel = null;

var isDebug = function(){
	return DEBUG;
}

var gameOver = function(){
	alert("GameOver ! [Your Score : " + game.score + "]");
	game.stop();
}

/**
 * 爆風
 */
var Blast = Class.create(Sprite, {
	remove : function(){
		game.rootScene.removeChild(this);
		delete this;
	},

	initialize : function(bomb) {
		var width  = 64;
		var height = 64;
		Sprite.call(this, width, height);
		
		this.image = game.assets[BLAST_IMAGE];
		this.x = bomb.x - width  / 2 + bomb.width  / 2;
		this.y = bomb.y - height / 2 + bomb.height / 2;
		
		var self = this;
		var startTime = game.time;
		this.addEventListener(enchant.Event.ENTER_FRAME, function(){
			// die avators if touched this blast
			for(var key in enemyList) {
				var enemy = enemyList[key];
				if(self.nearby(enemy)) {
					// die enemy
					enemy.remove();
					game.score += SCORE_PER_ENEMY_BASE * game.getLevel();
				}
			}
			
			if(self.nearby(player)) {
				gameOver();
			}

			// if this blast hit other bomb,
			// this explode.
			for(var key in bombList) {
				var otherBomb = bombList[key];
				if(self.nearby(otherBomb)) {
					otherBomb.explode();
				}
			}
			
			// disapper bomb and blast spent a time
			if(startTime - game.time > BLAST_TIME) {
				// delete blast
				self.remove();
			}
		});
		game.rootScene.addChild(this);
	},
	
	nearby : function(sprite){
		if ( ! sprite instanceof Sprite ) {
			return false;
		}
		var shorterEdge = (this.width > this.height) ? this.height : this.width;
		var radius =  shorterEdge / 2;
		
		return this.within(sprite, radius);
	}
});

// Bomb
var Bomb = Class.create(Sprite, {
	/**
	 * To identify unique
	 */
	id : 0,

	remove : function(){
		game.rootScene.removeChild(this);
		delete bombList[this.id];
		delete this;
	},

	initialize : function(player) {
		var width  = 16;
		var height = 16;
		
		Sprite.call(this, width, height);
		this.image = game.assets[BOMB_ICON];
		
		this.x = player.x + (player.width - this.width) / 2;
		this.y = player.y + (player.height- this.height) / 2;
		var self = this;
		
		var startFrame = game.frame;
		this.addEventListener(enchant.Event.ENTER_FRAME, function(){
			if(game.frame - startFrame > FPS * EXPLORD_TIME) {
				self.explode();
			}
		});
		game.rootScene.addChild(this);
		var bombListSize = bombList.push(this);
		this.id = bombListSize - 1;
	},
	
	explode : function() {
		this.remove();
		var blast = new Blast(this);
	}
});


var Avator = Class.create(Sprite, {
	initialize : function(width, height, icon, speed) {
		Sprite.call(this, width, height);
		
		// Override
		this.image   = game.assets[icon];
		this._speed = speed;
	},

	remove : function(){
		game.rootScene.removeChild(this);
		delete this;
	},

	
	nearby : function(sprite) {
		if ( ! sprite instanceof Sprite ) {
			return false;
		}
		var shorterEdge = (this.width > this.height) ? this.height : this.width;
		var radius =  shorterEdge / 2;
		
		return sprite.within(this, radius);
	},

	show : function(){
		game.rootScene.addChild(this);
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
		
		// set bomb
		var self = this;
		var beforeSetBombFrame = 0;
		game.rootScene.addEventListener(enchant.Event.TOUCH_START , function(event){
			if (game.frame - beforeSetBombFrame > SET_BOMB_INTERVAL * FPS) { 
				var bomb = new Bomb(self);
				beforeSetBombFrame = game.frame;
			}
		});
	}
});

var Enemy = Class.create(Avator, {

	/**
	 * To identify unique
	 */
	id : 0,

	initialize : function() {
		var width  = 32;
		var height = 32;
		var speed = 0.3;
		Avator.call(this, width, height, PLAYER_ICON, speed);

		// select image in png
		this.frame = 5;
		
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

		var enemyListSize = enemyList.push(this);
		this.id = enemyListSize - 1;

		//Enemy movment
		var self = this;
		this.addEventListener(enchant.Event.ENTER_FRAME, function(){
			var vect_x = (player.x - this.x) > 0 ? 1 : -1;
			var vect_y = (player.y - this.y) > 0 ? 1 : -1;
			
			this.x += vect_x * this._speed;
			this.y += vect_y * this._speed;
			
			//if Enemy touched player
			if(player.nearby(this)) {
				gameOver();
			}
		});
	},

	remove : function(){
		game.rootScene.removeChild(this);
		delete enemyList[this.id];
		delete this;
	}
});


var game = null;
window.onload = function(){
	game = new Game(GAME_FRAME_WIDTH, GAME_FRAME_HEIGHT);
	
	game.fps = FPS;
	game.preload(PLAYER_ICON);
	game.preload(BLAST_IMAGE);
	game.preload(BOMB_ICON);
	game.rootScene.backgroundColor = SCREEN_BACKGROUND_COLOR;
	game.time = GAME_TIME;
	game.score = 0;
	
	game.onload = function() {
		displayStartScreen();
	}
	
	// get level
	game.getLevel = function(){
		// level setting
		var level = 1;
		for (var i = 1; i <= MAX_LEVEL; i++) {
			if(this.time > GAME_TIME * (i / MAX_LEVEL)) {
				level = i;
				break;
			}
		}

		return level;
	}
	
	// set Menu
	game.setMenu = function(){
		var root = game.rootScene;
	
		// Display Scorek
		scoreLabel = new Label();
		scoreLabel.width  = GAME_FRAME_WIDTH  * (1/3) - 10;
		scoreLabel.height = GAME_FRAME_HEIGHT * (1/8);
		scoreLabel.x = 10;
		scoreLabel.y = 10;
		scoreLabel.text = PREFIX_SCORE;
		scoreLabel._element.setAttribute('id','scoreLabel');
		root.addChild(scoreLabel);
	
		// Display Timer
		timerLabel = new Label();
		timerLabel.width  = GAME_FRAME_WIDTH  * (1/3) - 10;
		timerLabel.height = GAME_FRAME_HEIGHT * (1/8);
		timerLabel.x = GAME_FRAME_WIDTH - timerLabel.width - 10;
		timerLabel.y = 10;
		timerLabel.text = PREFIX_TIMER;
		timerLabel._element.setAttribute('id','timerLabel');
		root.addChild(timerLabel);
	
		if(isDebug()){
			// Discplay stop button
			var stopButton = new Label();
			stopButton.width  = 30;
			stopButton.height = 20;
			stopButton.text = "stop";
			stopButton.x = 0;
			stopButton.y = (GAME_FRAME_HEIGHT - stopButton.height) / 2;
			stopButton.addEventListener(enchant.Event.TOUCH_START, function(){
					game.pause();
			});
			root.addChild(stopButton);
	
			// Discplay restart button
			var restartButton = new Label();
			restartButton.width  = 30;
			restartButton.height = 20;
			restartButton.text = "start";
			restartButton.x = GAME_FRAME_WIDTH - restartButton.width;
			restartButton.y = (GAME_FRAME_HEIGHT - restartButton.height) / 2 - 20;
			restartButton.addEventListener(enchant.Event.TOUCH_START, function(){
					game.start();
			});
			root.addChild(restartButton);
		}
	}


	// Display start page
	var displayStartScreen = function(){
		var root = game.rootScene;

		// set Start Label
		var startButton = new Label();
		startButton.width  = GAME_FRAME_WIDTH  * (3/4);
		startButton.height = GAME_FRAME_HEIGHT * (1/8);
		startButton.text = "start";
		startButton.x = (GAME_FRAME_WIDTH  - startButton.width) / 2;
		startButton.y = (GAME_FRAME_HEIGHT - startButton.height) / 2;
		startButton.textAlign = 'center';
		startButton._element.setAttribute('id','startButton');
		startButton.addEventListener(enchant.Event.TOUCH_END, function(){
			// delete start label
			game.rootScene.removeChild(this);
			delete this;

			// set menu
			game.setMenu();

			// Game Start !!!
			player = new Player(); player.show();
			
			var startTime = game.frame / FPS;
			var root = game.rootScene;
			root.addEventListener(enchant.Event.ENTER_FRAME, function(){

				// update timer
				var time = GAME_TIME - Math.floor(game.frame/game.fps);
				game.time = time;
				timerLabel.text = PREFIX_TIMER + time;

				// update score
				scoreLabel.text = PREFIX_SCORE + game.score;

				if(time <= 10) {
					timerLabel.color = "red";
				}

				//apear Enemy
				var level = game.getLevel();
				if(game.frame % (FPS - level) === 0) { // apear rate
					var enemy = new Enemy();
					enemy.show();
				}

				// Time over ! Finish the game.
				if(time == 0) {
					alert("TimeOver ! [Your Score: " + game.score + "]");
					game.stop();
				}
			});
		});

		root.addChild(startButton);
	}

	game.start();
}

