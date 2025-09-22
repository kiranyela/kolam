/********
Ported from the Processing Sketch by
Bárbara Almeida
https://www.openprocessing.org/sketch/296103/
with minor changes

A generative Kolam pattern
********/

var link;
var nlink;
var idx;
var pg; // Off-screen graphics buffer for the Kolam
var bgcolor;
var kolam;
var gui_kolam;

/**/
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  bgcolor = color(10, 20, 40); // A nice dark blue

  // Create the Kolam object to hold our parameters
  kolam = new Kolam();
  
  // Set up Dat.GUI controls
  gui_kolam = new dat.GUI();
  gui_kolam.add(kolam, 'tsize', 30, 80).name('Size').onChange(setupTiles);
  gui_kolam.add(kolam, 'margin', 2, 200).name('Margin').onChange(setupTiles);  
  gui_kolam.add(kolam, 'tnumber').name('Tiles').min(3).max(20).step(1).onChange(setupTiles);
  gui_kolam.add(kolam, 'rotation').name('Rotation').min(0).max(2 * Math.PI).step(QUARTER_PI / 4);  
  gui_kolam.add(kolam, 'refreshRate').name('Refresh Rate').min(10).max(200).step(10);

  // Initial setup
  setupTiles();
  configTiles();
}

/**/
function draw() {
  background(bgcolor); // Clear the canvas every frame

  // Only update the off-screen graphic if the animation is running
  if (idx <= 1) {
    drawTile();
  }
  
  // Draw the off-screen graphic to the main canvas
  push();
  translate(width / 2, height / 2);
  rotate(kolam.rotation);
  imageMode(CENTER);
  image(pg, 0, 0);
  pop();

  // Periodically generate a new pattern
  if (frameCount % kolam.refreshRate == 0) {
    configTiles();
  }
}

// Object to hold all the variables for our Kolam sketch
function Kolam() {
  this.tsize = 45;
  this.margin = 5;
  this.tnumber = 5;
  this.refreshRate = 120; // Slightly slower refresh rate
  this.rotation = QUARTER_PI;
}

// This function is called when the browser window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupTiles(); // Re-initialize the tiles to fit the new size
}

// Sets up the off-screen buffer and the link arrays
function setupTiles() {
  // Create the graphics buffer where the Kolam pattern will be drawn
  pg = createGraphics(
    kolam.tsize * kolam.tnumber + 2 * kolam.margin,
    kolam.tsize * kolam.tnumber + 2 * kolam.margin
  );

  link = [];
  nlink = [];
  // Populate the arrays with 1s
  for (var i = 0; i < (kolam.tnumber + 1); i++) {
    var pushThis = [];
    for (var j = 0; j < (kolam.tnumber + 1); j++) {
      pushThis.push(1);
    }
    link.push(pushThis);
    nlink.push(pushThis);
  }
}

// Configures the links for a new, symmetrical pattern
function configTiles() {
  idx = 0;
  var i, j;

  // Update links
  for (i = 0; i < link.length; i++) {
    for (j = 0; j < link[0].length; j++) {
      link[i][j] = nlink[i][j];
    }
  }

  // Create new links with 8-way symmetry
  var limit = random(0.4, 0.7);
  for (i = 0; i < nlink.length; i++) {
    for (j = 0; j < nlink.length / 2; j++) {
      let l = (random(1) > limit) ? 1 : 0; // Randomly link or unlink

      nlink[i][j] = l;
      nlink[i][nlink.length - j - 1] = l;
      nlink[j][i] = l;
      nlink[nlink.length - j - 1][i] = l;
      nlink[nlink.length - 1 - i][j] = l;
      nlink[nlink.length - 1 - i][nlink.length - j - 1] = l;
      nlink[j][nlink.length - 1 - i] = l;
      nlink[nlink.length - 1 - j][nlink.length - 1 - i] = l;
    }
  }
}

// Draws the actual Kolam pattern into the off-screen buffer (pg)
function drawTile() {
  pg.background(bgcolor);
  pg.noFill();
  pg.stroke(255);
  pg.strokeWeight(5);

  for (var i = 0; i < kolam.tnumber; i++) {
    for (var j = 0; j < kolam.tnumber; j++) {
      if ((i + j) % 2 == 0) {
        // Interpolate between the old and new patterns for a smooth animation
        var top_left = kolam.tsize / 2 * lerp(link[i][j], nlink[i][j], idx);
        var top_right = kolam.tsize / 2 * lerp(link[i + 1][j], nlink[i + 1][j], idx);
        var bottom_right = kolam.tsize / 2 * lerp(link[i + 1][j + 1], nlink[i + 1][j + 1], idx);
        var bottom_left = kolam.tsize / 2 * lerp(link[i][j + 1], nlink[i][j + 1], idx);

        pg.rect(i * kolam.tsize + kolam.margin, j * kolam.tsize + kolam.margin, kolam.tsize, kolam.tsize, top_left, top_right, bottom_right, bottom_left);
        pg.point(i * kolam.tsize + kolam.tsize / 2 + kolam.margin, j * kolam.tsize + kolam.tsize / 2 + kolam.margin);
      }
    }
  }

  idx += 0.02;
  idx = constrain(idx, 0, 1);
}