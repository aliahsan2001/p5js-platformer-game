/*
The Game Project
Week 20
The Final Game Project
## SYED ALI AHSAN ##
*/

// Global Variables
var gameChar_x;
var gameChar_y;
var floorPos_y;
var isLeft;
var isRight;
var isFalling;
var trees_x;
var cloud_x;
var cloudSpeed;
var mountain_x;
var cameraPosX;
var collectables;
var canyons;
var game_score;
var flagpole;
var lives;
var instruction;
var jumpSound;
var gamesound;
var lifeLost;
var itemPick;
var winningSound;

// Preload function to load sound files
function preload() {
    soundFormats('mp3', 'wav');

    // Load sounds and set volume
    jumpSound = loadSound('assets/jump.mp3');
    jumpSound.setVolume(0.1);
    gamesound = loadSound('assets/game bg.mp3');
    gamesound.setVolume(0.1);
    lifeLost = loadSound('assets/life lost.wav');
    lifeLost.setVolume(0.1);
    itemPick = loadSound('assets/Item pick up.mp3');
    itemPick.setVolume(0.1);
    winningSound = loadSound('assets/winning.mp3');
    winningSound.setVolume(0.1);
}

// Setup function to initialize the game environment
function setup() {
    createCanvas(1024, 576);
    floorPos_y = height * 3 / 4;
    lives = 3;
    instruction = true;
    startGame();
}

// Draw function to render the game
function draw() {
    // Sky
    background(46, 68, 130); // Fill the sky blue

    // Ground
    noStroke();
    fill(0, 155, 0);
    rect(0, floorPos_y, 1024, 144);
    fill(128, 0, 32);
    rect(0, floorPos_y + 18, 1024, 144);

    // Move the camera
    cameraPosX = gameChar_x - width / 2;
    push();
    translate(-cameraPosX, 0);

    if (instruction == true) {
        push();
        noStroke();
        fill(255, 215, 0);
        rect(95, 95, width - 190, height - 190);
        fill(62, 39, 35);
        rect(100, 100, width - 200, height - 200);
        fill(255, 255, 255);
        noStroke(255, 255, 0);
        textAlign(CENTER);
        textSize(22);
        text("Welcome to the Cowboy Robot Adventure!\n Help your robotic explorer navigate the rugged frontier and reach the final outpost.\n Use the WASD or arrow keys to move your Cowboy Robot.\n Be careful not to fall into the ravines!\n You only have 3 lives before the journey restarts.\n Collect all 9 energy cores along the way\n to boost your score and complete your mission successfully!", width / 2, 200);
        fill(212, 175, 55);
        textSize(30);
        text("HOW TO PLAY", width / 2, 150);
        textSize(30);
        text("PRESS THE SPACE BAR TO BEGIN", width / 2, 420);
        pop();
    }

    if (instruction == false) {
        // Draw mountains, trees, clouds, and flagpole
        drawMountain();
        drawTrees();
        drawClouds();
        renderFlagpole();

        // Show game score
        fill(255, 223, 0);
        noStroke();
        text("Collectibles collected: " + game_score + "/9", cameraPosX + 30, 50);

        // Display remaining lives as heart icons
        for (var i = 0; i < lives; i++) {
            fill(255, 0, 0);
            textSize(24);
            text("\u{1F916}", cameraPosX + 28 + i * 28, 80);
        }

        // Draw platforms
        for (var i = 0; i < platforms.length; i++) {
            platforms[i].draw();
        }

        // Lives counter and fall mechanic
        checkPlayerDie();

        // Check for collisions with canyons
        for (var j = 0; j < canyons.length; j++) {
            // Draw the canyon
            drawCanyon(canyons[j]);
            // To fall in Canyon
            checkCanyon(canyons[j]);
        }

        // Check for interactions with collectables
        for (var i = 0; i < collectables.length; i++) {
            if (collectables[i].isFound == false) {
                // Collectable item
                drawCollectable(collectables[i]);
                // To hide collectable
                checkCollectable(collectables[i]);
            }
        }

        // Check if the character is above the ground, then make it fall if there is no contact with a platform
        if (gameChar_y < floorPos_y) {
            var isContact = false;
            for (var i = 0; i < platforms.length; i++) {
                if (platforms[i].checkContact(gameChar_x, gameChar_y) == true) {
                    isContact = true;
                    break;
                }
            }
        }

        if (isContact == false) {
            gameChar_y += 2.5;
            isFalling = true;
        } else {
            isFalling = false;
        }

        // Check for player-enemy collisions
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].draw();

            var isContact = enemies[i].checkContact(gameChar_x, gameChar_y);

            if (isContact == true) {
                if (lives > 0) {
                    lives = lives - 1;
                    lifeLost.play();
                    startGame();
                    break;
                }
            }
        }

        // Display a game over message if there are no lives remaining
        if (lives == 0) {
            push();
            textSize(22);
            strokeWeight(4);
            fill(255, 69, 0);
            text("Game over. Press space to continue.", cameraPosX / 3, height / 2);
            pop();
            if (keyCode == 32) {
                setup();
                startGame();
            }
        }

        // Display a Level complete message when flagpole is reached
        if (flagpole.isReached == true) {
            push();
            textSize(22);
            strokeWeight(4);
            fill(255, 69, 0);
            text("Congratulations! You have reached the final outpost.", gameChar_x, gameChar_y / 1.2);
            pop();
        }

        // Prevent going too left
        if (gameChar_x < 300) {
            startGame();
        }

        // The game character
        if (isLeft && isFalling) {
            // Jumping-left code
            drawCharacterJumpingLeft();
        } else if (isRight && isFalling) {
            // Jumping-right code
            drawCharacterJumpingRight();
        } else if (isLeft) {
            // Walking left code
            drawCharacterWalkingLeft();
        } else if (isRight) {
            // Walking right code
            drawCharacterWalkingRight();
        } else if (isFalling) {
            // Jumping facing forwards code
            drawCharacterJumpingForward();
        } else {
            // Standing front facing code
            drawCharacterStanding();
        }
    }
    pop();

    // To move the game character left
    if (isLeft == true) {
        gameChar_x = gameChar_x - 3.5;
    }

    // To move the game character right
    if (isRight == true) {
        gameChar_x = gameChar_x + 3.5;
    }

    // Check distance of character and flagpole
    if (flagpole.isReached == false) {
        checkFlagpole();
    }
}

// KeyPressed function to control the animation of the character when keys are pressed
function keyPressed() {
    if (lives > 0) {
        if (keyCode == 65 || key == 'ArrowLeft') {
            isLeft = true;
        }

        if (keyCode == 68 || key == 'ArrowRight') {
            isRight = true;
        }

        if ((keyCode == 87 || key == 'ArrowUp' || keyCode == 32) && (gameChar_y == floorPos_y)) {
            gameChar_y -= 130;
            instruction = false;
            jumpSound.play();
        }

        if ((flagpole.isReached == true) && (keyCode == 87 || key == 'ArrowUp' || keyCode == 32)) {
            startGame();
        }
    }
}

// KeyReleased function to control the animation of the character when keys are released
function keyReleased() {
    if (keyCode == 65 || key == 'ArrowLeft') {
        isLeft = false;
    }

    if (keyCode == 68 || key == 'ArrowRight') {
        isRight = false;
    }
}

// Function to draw trees on the canvas
function drawTrees() {
    for (let i = 0; i < tree_x.length; i++) {
        fill([123, 63, 0]); // Brown color for trunk
        rect(tree_x[i] + 788, floorPos_y, 43, -100);
        fill([0, 130, 0]); // Green color for leaves
        triangle(tree_x[i] + 750, floorPos_y - 100, tree_x[i] + 866, floorPos_y - 100, tree_x[i] + 808, floorPos_y - 185);
        triangle(tree_x[i] + 750, floorPos_y - 130, tree_x[i] + 866, floorPos_y - 130, tree_x[i] + 808, floorPos_y - 215);
    }
}

// Function to draw mountains on the canvas
function drawMountain() {
    for (let i = 0; i < mountain_x.length; i++) {
        fill([80, 60, 60]); // Mountain color
        triangle(
            400 + mountain_x[i], floorPos_y,
            400 + 270 + mountain_x[i], floorPos_y,
            400 + 270 / 2 + mountain_x[i], floorPos_y - 297
        );
        // Smaller mountains
        triangle(
            340 + mountain_x[i], floorPos_y,
            480 + mountain_x[i], floorPos_y,
            410 + mountain_x[i], floorPos_y - 297 / 1.5
        );
        triangle(
            520 + mountain_x[i], floorPos_y,
            750 + mountain_x[i], floorPos_y,
            630 + mountain_x[i], floorPos_y - 297 / 1.3
        );
    }
}

// Function to draw clouds on the canvas
function drawClouds() {
    for (let i = 0; i < cloud_x.length; i++) {
        fill(184, 190, 195); // White color for clouds

        // Update cloud x position
        cloud_x[i] += cloudSpeed;

        // Cloud
        ellipse(cloud_x[i], floorPos_y - 322, 150, 150);
        ellipse(cloud_x[i] - 86, floorPos_y - 322, 110, 100);
        ellipse(cloud_x[i] + 73, floorPos_y - 322, 110, 90);
    }
}

// Function to draw collectable
function drawCollectable(t_collectable) {
    if (!t_collectable.isFound) {
        noStroke();
        fill(100, 100, 255);
        ellipse(t_collectable.x_pos, t_collectable.y_pos, 30);
        fill(0, 200, 255);
        ellipse(t_collectable.x_pos, t_collectable.y_pos, 30 - 13);
        fill(255, 255, 255, 150);
        ellipse(t_collectable.x_pos + 5, t_collectable.y_pos - 5, 12, 12);
    }
}

// Function to check if character collects a collectable
function checkCollectable(t_collectable) {
    if (dist(gameChar_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 22) {
        t_collectable.isFound = true;
        game_score += 1;
        itemPick.play();
    }
}

// Function to draw canyon
function drawCanyon(t_canyon) {
    fill(46, 68, 130);
    rect(t_canyon.x_pos, t_canyon.y_pos + 15, 50, height);
}

// Function to handle character-canyon interaction
function checkCanyon(t_canyon) {
    if ((gameChar_x - 8 > t_canyon.x_pos + 2) && (gameChar_x + 8 < t_canyon.x_pos + 50) && (gameChar_y >= floorPos_y)) {
        gameChar_y += 20; // Make the character fall
        if (gameChar_y > floorPos_y) { // Check if the character has fallen off the screen
            lives -= 1;
            startGame();
            lifeLost.play();
        }
    }
}

// Function to render the flagpole
function renderFlagpole() {
    push();
    strokeWeight(5);
    stroke(139, 69, 19); // Brown color for a wooden pole
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250); // Draw the pole

    // Draw the flag with a cowboy-themed design
    if (flagpole.isReached == false) {
        fill(244, 128, 55); // Gold color for the flag
        rect(flagpole.x_pos, floorPos_y - 50, 70, 50); // Flag base
        fill(0); // Black color for the design
        textSize(20);
        textAlign(CENTER, CENTER);
        text("🤠", flagpole.x_pos + 35, floorPos_y - 25); // Cowboy emoji as the flag design
    } else {
        fill(244, 128, 55); // Gold color for the flag
        rect(flagpole.x_pos, floorPos_y - 250, 70, 50); // Flag base
        fill(0); // Black color for the design
        textSize(20);
        textAlign(CENTER, CENTER);
        text("⭐", flagpole.x_pos + 35, floorPos_y - 225); // Star emoji as the flag design
    }
    pop();
}

// Function to check if the character reaches the flagpole
function checkFlagpole() {
    var d = abs(gameChar_x - flagpole.x_pos);
    if (d < 15 && game_score == 9) {
        flagpole.isReached = true;
        winningSound.play();
    }
}

// Function to check if the player dies
function checkPlayerDie() {
    if (gameChar_y > height) { // Check if the character has fallen off the screen
        lives -= 1;
        startGame();
        lifeLost.play();
    }
}

// Function to start the game
function startGame() {
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    isLeft = false;
    isRight = false;
    isFalling = false;
    cameraPosX = 0;
    game_score = 0;
    cloudSpeed = 0.6;

    flagpole = {
        x_pos: 2100,
        isReached: false
    };

    collectables = [
        { x_pos: 650, y_pos: floorPos_y - 15, isFound: false },
        { x_pos: 800, y_pos: floorPos_y - 15, isFound: false },
        { x_pos: 870, y_pos: floorPos_y - 115, isFound: false },
        { x_pos: 1000, y_pos: floorPos_y - 15, isFound: false },
        { x_pos: 1220, y_pos: floorPos_y - 15, isFound: false },
        { x_pos: 1335, y_pos: floorPos_y - 15, isFound: false },
        { x_pos: 1473, y_pos: floorPos_y - 15, isFound: false },
        { x_pos: 1620, y_pos: floorPos_y - 115, isFound: false },
        { x_pos: 1900, y_pos: floorPos_y - 15, isFound: false },
    ];

    canyons = [
        { x_pos: 580, y_pos: floorPos_y - 15 },
        { x_pos: 1100, y_pos: floorPos_y - 15 },
        { x_pos: 1400, y_pos: floorPos_y - 15 },
        { x_pos: 1800, y_pos: floorPos_y - 15 },
    ];

    tree_x = [-500, -100, 900, 400, 1100];
    mountain_x = [-250, -350, 300, 1600];
    cloud_x = [0, 340, 800, 1200, 1700, 2000, 2600];

    platforms = [];
    platforms.push(createPlatforms(1600, floorPos_y - 100, 100));
    platforms.push(createPlatforms(800, floorPos_y - 100, 150));

    enemies = [];
    enemies.push(new Enemy(700, floorPos_y - 240, 200));
    enemies.push(new Enemy(1600, floorPos_y - 340, 100));

    // Play the background music if it's not already playing
    if (gamesound.isPlaying() == false) {
        gamesound.play();
    }
}

// Function to handle character-platform collision detection
function createPlatforms(XPos, YPos, length) {
    var p = {
        x: XPos,
        y: YPos,
        length: length,
        draw: function () {
            fill(0, 155, 0); // Green color
            rect(this.x, this.y, this.length, 20);

            // Second rectangle
            fill(128, 0, 32); // Dark red color
            rect(this.x, this.y + 12, this.length, 20);
        },
        checkContact: function (GC_X, GC_Y) {
            if (GC_X > this.x && GC_X < this.x + this.length) {
                var d = this.y - GC_Y;
                if (d >= 0 && d < 5) {
                    return true;
                }
            }
            return false;
        }
    };
    return p; // Returning the created object
}

// Function to handle character-enemy collision detection
function Enemy(x, y, range) {
    this.x = x;
    this.y = y + 200;
    this.range = range;

    this.currentX = x;
    this.inc = 1;

    this.update = function () {
        this.currentX += this.inc;

        if (this.currentX >= this.x + this.range) {
            this.inc = -1;
        } else if (this.currentX < this.x) {
            this.inc = 1;
        }
    }

    this.draw = function () {
        this.update();
        push();

        // Head
        fill(0, 255, 0); // Green color for the Creeper
        rect(this.currentX - 15, this.y - 20, 30, 30); // Head

        // Body
        rect(this.currentX - 7.5, this.y + 10, 15, 20); // Body

        // Legs
        rect(this.currentX - 10, this.y + 30, 7.5, 10); // Left leg
        rect(this.currentX + 2.5, this.y + 30, 7.5, 10); // Right leg

        // Face (eyes and mouth)
        fill(0); // Black color
        rect(this.currentX - 10, this.y - 15, 5, 5); // Left eye
        rect(this.currentX + 5, this.y - 15, 5, 5); // Right eye
        rect(this.currentX - 5, this.y - 5, 10, 10); // Mouth

        pop();
    }

    this.checkContact = function (gc_x, gc_y) {
        var d = dist(gc_x, gc_y, this.currentX, this.y);
        if (d < 50) {
            return true;
        }
        return false;
    }
}

// Functions to draw the character in different states
function drawCharacterJumpingLeft() {
    // Jumping-left code
    fill(180, 50, 50); // Main body
    rect(gameChar_x - 8, gameChar_y - 42 - 16, 16, 24, 5);
    fill(180, 50, 50); // Head
    ellipse(gameChar_x, gameChar_y - 55 - 16, 30, 24);
    fill(0); // Cowboy Hat
    arc(gameChar_x, gameChar_y - 56 - 16, 50, 20, PI, 0);
    rect(gameChar_x - 12.5, gameChar_y - 75 - 16, 25, 15);
    fill(150, 150, 150); // Arm
    rect(gameChar_x - 20, gameChar_y - 38 - 16, 22, 6, 3);
    fill(150, 150, 150); // Legs
    rect(gameChar_x - 3, gameChar_y - 18 - 16, 7, 22, 3);
    fill(255); // Eyes
    ellipse(gameChar_x - 6, gameChar_y - 55 - 16, 8, 8);
    fill(0); // Pupils
    ellipse(gameChar_x - 7, gameChar_y - 55 - 16, 4, 4);
    fill(255, 69, 0); // Booster
    ellipse(gameChar_x - 6 + 7, gameChar_y + 10 - 16, 10, 16);
    fill(255, 215, 0); // Inner flame
    ellipse(gameChar_x - 6 + 7, gameChar_y + 10 - 16, 7, 10);
}

function drawCharacterJumpingRight() {
    // Jumping-right code
    fill(180, 50, 50); // Main body
    rect(gameChar_x - 8, gameChar_y - 42 - 16, 16, 24, 5);
    fill(180, 50, 50); // Head
    ellipse(gameChar_x, gameChar_y - 55 - 16, 30, 24);
    fill(0); // Cowboy Hat
    arc(gameChar_x, gameChar_y - 56 - 15, 50, 20, PI, 0);
    rect(gameChar_x - 12.5, gameChar_y - 75 - 16, 25, 15);
    fill(150, 150, 150); // Arms
    rect(gameChar_x - 3, gameChar_y - 38 - 16, 22, 6, 3);
    fill(150, 150, 150); // Legs
    rect(gameChar_x - 3, gameChar_y - 18 - 16, 7, 22, 3);
    fill(255); // Eyes
    ellipse(gameChar_x + 6, gameChar_y - 55 - 16, 8, 8);
    fill(0); // Pupils
    ellipse(gameChar_x + 7, gameChar_y - 55 - 16, 4, 4);
    fill(255, 69, 0); // Boosters
    ellipse(gameChar_x - 6 + 7, gameChar_y + 10 - 16, 10, 16);
    fill(255, 215, 0); // Inner flame
    ellipse(gameChar_x - 6 + 7, gameChar_y + 10 - 16, 7, 10);
}

function drawCharacterWalkingLeft() {
    // Walking left code
    fill(180, 50, 50); // Main body
    rect(gameChar_x - 8, gameChar_y - 42, 16, 24, 5);
    fill(180, 50, 50); // Head
    ellipse(gameChar_x, gameChar_y - 55, 30, 24);
    fill(0); // Cowboy Hat
    arc(gameChar_x, gameChar_y - 56, 50, 20, PI, 0);
    rect(gameChar_x - 12.5, gameChar_y - 75, 25, 15);
    fill(150, 150, 150); // Arms
    rect(gameChar_x - 20, gameChar_y - 38, 22, 6, 3);
    fill(150, 150, 150); // Legs
    rect(gameChar_x - 3, gameChar_y - 18, 7, 20.5, 3);
    fill(255); // Eyes
    ellipse(gameChar_x - 6, gameChar_y - 55, 8, 8);
    fill(0); // Pupils
    ellipse(gameChar_x - 7, gameChar_y - 55, 4, 4);
}

function drawCharacterWalkingRight() {
    // Walking right code
    fill(180, 50, 50); // Main body
    rect(gameChar_x - 8, gameChar_y - 42, 16, 24, 5);
    fill(180, 50, 50); // Head
    ellipse(gameChar_x, gameChar_y - 55, 30, 24);
    fill(0); // Cowboy Hat
    arc(gameChar_x, gameChar_y - 56, 50, 20, PI, 0);
    rect(gameChar_x - 12.5, gameChar_y - 75, 25, 15);
    fill(150, 150, 150); // Arms
    rect(gameChar_x - 3, gameChar_y - 38, 22, 6, 3);
    fill(150, 150, 150); // Legs
    rect(gameChar_x - 3, gameChar_y - 18, 7, 20.5, 3);
    fill(255); // Eyes
    ellipse(gameChar_x + 6, gameChar_y - 55, 8, 8);
    fill(0); // Pupils
    ellipse(gameChar_x + 7, gameChar_y - 55, 4, 4);
}

function drawCharacterJumpingForward() {
    // Jumping facing forwards code
    fill(180, 50, 50); // Main body
    rect(gameChar_x - 12, gameChar_y - 42 - 15, 24, 24, 5);
    fill(180, 50, 50); // Head
    ellipse(gameChar_x, gameChar_y - 55 - 15, 30, 24);
    fill(0); // Cowboy Hat
    arc(gameChar_x, gameChar_y - 56 - 15, 50, 20, PI, 0);
    rect(gameChar_x - 12.5, gameChar_y - 75 - 15, 25, 15);
    fill(150, 150, 150); // Arms
    rect(gameChar_x - 19, gameChar_y - 38 - 15, 6, 22, 3);
    rect(gameChar_x + 13, gameChar_y - 55 - 15, 6, 22, 3);
    fill(255, 69, 0); // Boosters
    ellipse(gameChar_x - 6, gameChar_y + 10 - 16, 10, 16);
    ellipse(gameChar_x + 6, gameChar_y + 10 - 16, 10, 16);
    fill(255, 215, 0); // Inner flame
    ellipse(gameChar_x - 6, gameChar_y + 10 - 16, 7, 10);
    ellipse(gameChar_x + 6, gameChar_y + 10 - 16, 7, 10);
    fill(150, 150, 150); // Legs
    rect(gameChar_x - 9, gameChar_y - 18 - 15, 7, 22, 3);
    rect(gameChar_x + 2, gameChar_y - 18 - 15, 7, 22, 3);
    fill(255, 255, 255); // Eyes
    ellipse(gameChar_x - 6, gameChar_y - 55 - 15, 8, 8);
    ellipse(gameChar_x + 6, gameChar_y - 55 - 15, 8, 8);
    fill(0); // Eye pupils
    ellipse(gameChar_x - 6, gameChar_y - 55 - 15, 4, 4);
    ellipse(gameChar_x + 6, gameChar_y - 55 - 15, 4, 4);
    fill(255, 255, 255, 100); // Eye highlights
    ellipse(gameChar_x - 5, gameChar_y - 57 - 15, 2, 2);
    ellipse(gameChar_x + 5, gameChar_y - 57 - 15, 2, 2);
    fill(0, 200, 255); // Glowing outer ring
    ellipse(gameChar_x, gameChar_y - 30 - 15, 9, 9);
    fill(100, 100, 255); // Inner core
    ellipse(gameChar_x, gameChar_y - 30 - 15, 5, 5);
    fill(255, 255, 255, 150); // Detailing
    ellipse(gameChar_x + 1, gameChar_y - 30 - 15 - 1, 2, 2);
}

function drawCharacterStanding() {
    // Standing front facing code
    fill(180, 50, 50); // Main body
    rect(gameChar_x - 12, gameChar_y - 42, 24, 24, 5);
    fill(180, 50, 50); // Head
    ellipse(gameChar_x, gameChar_y - 55, 30, 24);
    fill(150, 150, 150); // Arms
    rect(gameChar_x - 18, gameChar_y - 38, 6, 22, 3);
    rect(gameChar_x + 12, gameChar_y - 38, 6, 22, 3);
    fill(150, 150, 150); // Legs
    rect(gameChar_x - 9, gameChar_y - 18, 7, 20.5, 3);
    rect(gameChar_x + 2, gameChar_y - 18, 7, 20.5, 3);
    fill(255, 255, 255); // Eyes
    ellipse(gameChar_x - 6, gameChar_y - 55, 8, 8);
    ellipse(gameChar_x + 6, gameChar_y - 55, 8, 8);
    fill(0); // Eye pupils
    ellipse(gameChar_x - 6, gameChar_y - 55, 4, 4);
    ellipse(gameChar_x + 6, gameChar_y - 55, 4, 4);
    fill(255, 255, 255, 100); // Eye highlights
    ellipse(gameChar_x - 5, gameChar_y - 57, 2, 2);
    ellipse(gameChar_x + 5, gameChar_y - 57, 2, 2);
    fill(0); // Cowboy Hat
    arc(gameChar_x, gameChar_y - 56, 50, 20, PI, 0);
    rect(gameChar_x - 12.5, gameChar_y - 75, 25, 15);
    fill(0, 200, 255); // Glowing outer ring
    ellipse(gameChar_x, gameChar_y - 30, 9, 9);
    fill(100, 100, 255); // Inner core
    ellipse(gameChar_x, gameChar_y - 30, 5, 5);
    fill(255, 255, 255, 150); // Detailing
    ellipse(gameChar_x + 1, gameChar_y - 30 - 1, 2, 2);
}