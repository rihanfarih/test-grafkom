var Gallery = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000),
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector3(),
    textureLoader: new THREE.TextureLoader(),
    raycastSetUp: function () {
      Gallery.mouse.x = 0; //(0.5) * 2 - 1;
      Gallery.mouse.y = 0; //(0.5) * 2 + 1;
      Gallery.mouse.z = 0.0001;
    },
    
  };
  
  Gallery.raycastSetUp();
  
  
  
  
  
  function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) { 
    // note: texture passed by reference, will be updated by the update function.
      
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet. 
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
    texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );
  
    // how long should each image be displayed?
    this.tileDisplayDuration = tileDispDuration;
  
    // how long has the current image been displayed?
    this.currentDisplayTime = 0;
  
    // which image is currently being displayed?
    this.currentTile = 0;
      
    this.update = function( milliSec )
    {
      this.currentDisplayTime += milliSec;
      while (this.currentDisplayTime > this.tileDisplayDuration)
      {
        this.currentDisplayTime -= this.tileDisplayDuration;
        this.currentTile++;
        if (this.currentTile == this.numberOfTiles)
          this.currentTile = 0;
        var currentColumn = this.currentTile % this.tilesHorizontal;
        texture.offset.x = currentColumn / this.tilesHorizontal;
        var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
        texture.offset.y = currentRow / this.tilesVertical;
      }
    };
  }   
  