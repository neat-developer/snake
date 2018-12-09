"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SNAKE_SPRITE = "snake_tiles";
var TAIL = 2;

var SnakeGame =
/*#__PURE__*/
function () {
  function SnakeGame(options) {
    _classCallCheck(this, SnakeGame);

    this.options = options;
    this.images = [];
    this.canvas = document.getElementById(this.options.id);
    this.ctx = this.canvas && this.canvas.getContext('2d');
    this.gOver = false;
    this.tileSize = 25;
    this.tail = TAIL;
    this.segments = [];
    this.positions = {};
    this.movement = null;
    this.init();
  }

  _createClass(SnakeGame, [{
    key: "init",
    value: function init() {
      var _this = this;

      if (!this.ctx) {
        console.log("there is not canvas id");
        return false;
      }

      this.loadImages(this.options.images, function () {
        _this.setStartPosition();

        _this.updateApplePos();

        document.addEventListener('keydown', function (e) {
          _this.keyDown(e);
        });
        window.requestAnimationFrame(function () {
          _this.updateLoopFrame();

          _this.updateTimeStamp();
        });
      });
    } //    Game methods

  }, {
    key: "loop",
    value: function loop() {
      if (new Date().getTime() - this.latestTimeStamp > this.options.speed && !this.gOver) {
        this.setBackground();
        this.addApple();
        this.updateSegments();
        this.changeSnakePosition();

        if (!this.gOver) {
          this.drawSnake();
        } else {
          this.setStartPosition();
          this.gOver = false;
        }

        this.updateTimeStamp();
      }

      this.updateLoopFrame();
    }
  }, {
    key: "updateLoopFrame",
    value: function updateLoopFrame() {
      var _this2 = this;

      window.requestAnimationFrame(function () {
        _this2.loop();
      });
    }
  }, {
    key: "updateApplePos",
    value: function updateApplePos() {
      this.positions.apple = {};
      this.positions.apple.x = Math.floor(Math.random() * (this.canvas.width / this.tileSize)) * this.tileSize;
      this.positions.apple.y = Math.floor(Math.random() * (this.canvas.height / this.tileSize)) * this.tileSize;
    }
  }, {
    key: "updateSegments",
    value: function updateSegments() {
      this.segments.unshift(Object.assign({}, this.positions.snake));

      while (this.segments.length > this.tail) {
        this.segments.pop();
      }
    }
  }, {
    key: "changeSnakePosition",
    value: function changeSnakePosition() {
      var _this3 = this;

      var snakeDirections = this.movement.split("|").map(function (direction) {
        return Number(direction);
      });
      this.positions.snake.x += snakeDirections[0] * this.tileSize;
      this.positions.snake.y += snakeDirections[1] * this.tileSize;
      this.positions.snake.x >= this.canvas.width && this.gameOver(); // right

      this.positions.snake.y >= this.canvas.height && this.gameOver(); // down

      this.positions.snake.y < 0 && this.gameOver(); // top

      this.positions.snake.x < 0 && this.gameOver(); // left
      // snake eat an apple

      if (this.positions.snake.x === this.positions.apple.x && this.positions.snake.y === this.positions.apple.y) {
        this.eatApple();
      } // snake eat an segment


      this.segments.forEach(function (segment) {
        if (segment.x === _this3.positions.snake.x && segment.y === _this3.positions.snake.y) {
          _this3.gameOver();
        }
      });
    }
  }, {
    key: "eatApple",
    value: function eatApple() {
      this.setBackground();
      this.updateApplePos();
      this.addApple();
      this.tail++;
    }
  }, {
    key: "setStartPosition",
    value: function setStartPosition() {
      this.positions.snake = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      };
      this.tail = TAIL;
      this.segments = [];
      this.updateMovement('right');
    }
  }, {
    key: "updateMovement",
    value: function updateMovement(side) {
      var positions = {
        "left": "-1|0",
        "right": "1|0",
        "top": "0|-1",
        "down": "0|1"
      };
      this.movement = positions[side];
    }
  }, {
    key: "gameOver",
    value: function gameOver() {
      this.gOver = true;
    } //    Draw methods

  }, {
    key: "addApple",
    value: function addApple() {
      this.addTileToCanvas(0, 3, this.positions.apple.x, this.positions.apple.y);
    }
  }, {
    key: "setBackground",
    value: function setBackground() {
      this.clearCanvas();
      var tileLengthInCanvasX = this.canvas.width / this.tileSize;
      var tileLengthInCanvasY = this.canvas.height / this.tileSize;

      for (var i = 0; i < tileLengthInCanvasX; i++) {
        for (var j = 0; j < tileLengthInCanvasY; j++) {
          this.addTileToCanvas(1, 3, i * this.tileSize, j * this.tileSize);
        }
      }
    }
  }, {
    key: "drawSnake",
    value: function drawSnake() {
      var segments = this.segments.slice();
      segments.unshift(this.positions.snake); // add head to list

      for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        var sx = segment.x;
        var sy = segment.y;
        var tilePosX = 0;
        var tilePosY = 0;

        if (i === 0) {
          // head
          var nSeg = segments[i + 1];

          if (nSeg.y > sy) {
            // up
            tilePosX = 3;
            tilePosY = 0;
          } else if (nSeg.x < sx) {
            // right
            tilePosX = 4;
            tilePosY = 0;
          } else if (nSeg.y < sy) {
            // down
            tilePosX = 4;
            tilePosY = 1;
          } else if (nSeg.x > sx) {
            // left
            tilePosX = 3;
            tilePosY = 1;
          }
        } else if (segments.length - 1 === i) {
          // tail
          var pSeg = segments[i - 1];

          if (pSeg.y < sy) {
            // up
            tilePosX = 3;
            tilePosY = 2;
          } else if (pSeg.x > sx) {
            // right
            tilePosX = 4;
            tilePosY = 2;
          } else if (pSeg.y > sy) {
            // down
            tilePosX = 4;
            tilePosY = 3;
          } else if (pSeg.x < sx) {
            // left
            tilePosX = 3;
            tilePosY = 3;
          }
        } else {
          // body 
          var _pSeg = segments[i - 1];
          var _nSeg = segments[i + 1];

          if (_pSeg.x < sx && _nSeg.x > sx || _nSeg.x < sx && _pSeg.x > sx) {
            // left right
            tilePosX = 1;
            tilePosY = 0;
          } else if (_pSeg.x < sx && _nSeg.y > sy || _nSeg.x < sx && _pSeg.y > sy) {
            // left down
            tilePosX = 2;
            tilePosY = 0;
          } else if (_pSeg.y < sy && _nSeg.y > sy || _nSeg.y < sy && _pSeg.y > sy) {
            // up down
            tilePosX = 2;
            tilePosY = 1;
          } else if (_pSeg.y < sy && _nSeg.x < sx || _nSeg.y < sy && _pSeg.x < sx) {
            // top left
            tilePosX = 2;
            tilePosY = 2;
          } else if (_pSeg.x > sx && _nSeg.y < sy || _nSeg.x > sx && _pSeg.y < sy) {
            //right up
            tilePosX = 0;
            tilePosY = 1;
          } else if (_pSeg.y > sy && _nSeg.x > sx || _nSeg.y > sy && _pSeg.x > sx) {
            // down right
            tilePosX = 0;
            tilePosY = 0;
          }
        }

        this.addTileToCanvas(tilePosX, tilePosY, sx, sy);
      }
    } //    Service methods

    /**
     *
     * @param images - array
     * @param callback - callback function
     */

  }, {
    key: "loadImages",
    value: function loadImages(images, callback) {
      var _this4 = this;

      var promises = [];
      Array.isArray(images) && images.forEach(function (image) {
        promises.push(new Promise(function (resolve) {
          var img = new Image();
          img.src = image.path;

          img.onload = function () {
            _this4.images[image.name] = img;
            resolve();
          };
        }));
      });
      Promise.all(promises).then(function () {
        callback();
      });
    }
  }, {
    key: "clearCanvas",
    value: function clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }, {
    key: "updateTimeStamp",
    value: function updateTimeStamp() {
      this.latestTimeStamp = +new Date();
    }
  }, {
    key: "keyDown",
    value: function keyDown(event) {
      var keyCode = event.keyCode;

      switch (keyCode) {
        case 37:
          this.updateMovement('left');
          break;

        case 38:
          this.updateMovement('top');
          break;

        case 39:
          this.updateMovement('right');
          break;

        case 40:
          this.updateMovement('down');
          break;
      }
    }
  }, {
    key: "addTileToCanvas",
    value: function addTileToCanvas(tpx, tpy, sx, sy) {
      // image, posX in tile.png, posY in tile.png, tileWidth, tileHeight, posX in canvas, posY in canvas, tileSize in canvas = 25
      return this.ctx.drawImage(this.images[SNAKE_SPRITE], tpx * 64, tpy * 64, 64, 64, sx, sy, this.tileSize, this.tileSize);
    }
  }]);

  return SnakeGame;
}();

(function () {
  new SnakeGame({
    id: 'snake_game',
    speed: 200,
    images: [{
      name: SNAKE_SPRITE,
      path: "images/snake-tiles.png"
    }]
  });
})();
"use strict";