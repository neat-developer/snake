const SNAKE_SPRITE = "snake_tiles";
const TAIL = 2;

class SnakeGame {
    constructor(options) {
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

    init() {
        if (!this.ctx) {
            console.log("there is not canvas id");
            return false;
        }

        this.loadImages(this.options.images, () => {
            this.setStartPosition();
            this.updateApplePos();

            document.addEventListener('keydown', e => {
                this.keyDown(e);
            });

            window.requestAnimationFrame(
                (() => {
                    this.updateLoopFrame();
                    this.updateTimeStamp();
                })
            )
        });
    }

    //    Game methods
    loop() {
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

    updateLoopFrame() {
        window.requestAnimationFrame(() => {
            this.loop();
        });
    }


    updateApplePos() {
        this.positions.apple = {};
        this.positions.apple.x = Math.floor(Math.random() * (this.canvas.width / this.tileSize)) * this.tileSize;
        this.positions.apple.y = Math.floor(Math.random() * (this.canvas.height / this.tileSize)) * this.tileSize;
    }

    updateSegments() {
        this.segments.unshift(Object.assign({}, this.positions.snake));
        while (this.segments.length > this.tail) {
            this.segments.pop();
        }
    }

    changeSnakePosition() {
        let snakeDirections = this.movement.split("|").map(direction => Number(direction));
        this.positions.snake.x += snakeDirections[0] * this.tileSize;
        this.positions.snake.y += snakeDirections[1] * this.tileSize;


        this.positions.snake.x >= this.canvas.width && this.gameOver(); // right
        this.positions.snake.y >= this.canvas.height && this.gameOver(); // down
        this.positions.snake.y < 0 && this.gameOver(); // top
        this.positions.snake.x < 0 && this.gameOver(); // left

        // snake eat an apple
        if (this.positions.snake.x === this.positions.apple.x && this.positions.snake.y === this.positions.apple.y) {
            this.eatApple();
        }

        // snake eat an segment
        this.segments.forEach(segment => {
            if (segment.x === this.positions.snake.x && segment.y === this.positions.snake.y) {
                this.gameOver();
            }
        })
    }


    eatApple() {
        this.setBackground();
        this.updateApplePos();
        this.addApple();
        this.tail++;
    }

    setStartPosition() {
        this.positions.snake = {x: this.canvas.width / 2, y: this.canvas.height / 2};
        this.tail = TAIL;
        this.segments = [];
        this.updateMovement('right');
    }

    updateMovement(side) {
        let positions = {
            "left": "-1|0",
            "right": "1|0",
            "top": "0|-1",
            "down": "0|1"
        };

        this.movement = positions[side];
    }


    gameOver() {
        this.gOver = true;
    }

    //    Draw methods

    addApple() {
        this.addTileToCanvas(0, 3, this.positions.apple.x, this.positions.apple.y);
    }

    setBackground() {
        this.clearCanvas();
        let tileLengthInCanvasX = this.canvas.width / this.tileSize;
        let tileLengthInCanvasY = this.canvas.height / this.tileSize;

        for (var i = 0; i < tileLengthInCanvasX; i++) {
            for (var j = 0; j < tileLengthInCanvasY; j++) {
                this.addTileToCanvas(1, 3, i * this.tileSize, j * this.tileSize);
            }
        }
    }

    drawSnake() {
        let segments = this.segments.slice();
        segments.unshift(this.positions.snake); // add head to list

        for (var i = 0; i < segments.length; i++) {
            let segment = segments[i];
            let sx = segment.x;
            let sy = segment.y;

            let tilePosX = 0;
            let tilePosY = 0;

            if (i === 0) {
                // head
                let nSeg = segments[i + 1];
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
                let pSeg = segments[i - 1];
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
                let pSeg = segments[i - 1];
                let nSeg = segments[i + 1];
                if (pSeg.x < sx && nSeg.x > sx || nSeg.x < sx && pSeg.x > sx) {
                    // left right
                    tilePosX = 1;
                    tilePosY = 0;
                } else if (pSeg.x < sx && nSeg.y > sy || nSeg.x < sx && pSeg.y > sy) {
                    // left down
                    tilePosX = 2;
                    tilePosY = 0;
                } else if (pSeg.y < sy && nSeg.y > sy || nSeg.y < sy && pSeg.y > sy) {
                    // up down
                    tilePosX = 2;
                    tilePosY = 1;
                } else if (pSeg.y < sy && nSeg.x < sx || nSeg.y < sy && pSeg.x < sx) {
                    // top left
                    tilePosX = 2;
                    tilePosY = 2;
                } else if (pSeg.x > sx && nSeg.y < sy || nSeg.x > sx && pSeg.y < sy) {
                    //right up
                    tilePosX = 0;
                    tilePosY = 1;
                } else if (pSeg.y > sy && nSeg.x > sx || nSeg.y > sy && pSeg.x > sx) {
                    // down right
                    tilePosX = 0;
                    tilePosY = 0;
                }
            }
            this.addTileToCanvas(tilePosX, tilePosY, sx, sy);
        }
    }

    //    Service methods
    /**
     *
     * @param images - array
     * @param callback - callback function
     */
    loadImages(images, callback) {
        let promises = [];
        Array.isArray(images) && images.forEach(image => {
            promises.push(new Promise(resolve => {
                let img = new Image();
                img.src = image.path;
                img.onload = () => {
                    this.images[image.name] = img;
                    resolve();
                }
            }));
        });

        Promise.all(promises).then(() => {
            callback();
        });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateTimeStamp() {
        this.latestTimeStamp = +new Date();
    }

    keyDown(event) {
        let keyCode = event.keyCode;
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

    addTileToCanvas(tpx, tpy, sx, sy) {
        // image, posX in tile.png, posY in tile.png, tileWidth, tileHeight, posX in canvas, posY in canvas, tileSize in canvas = 25
        return this.ctx.drawImage(this.images[SNAKE_SPRITE], tpx * 64, tpy * 64, 64, 64, sx, sy, this.tileSize, this.tileSize);
    }
}

(function () {
    new SnakeGame({
        id: 'snake_game',
        speed: 200,
        images: [{name: SNAKE_SPRITE, path: "images/snake-tiles.png"}]
    })
})();