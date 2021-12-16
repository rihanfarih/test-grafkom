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
    boot: function () {
      //renderer time delta
      Gallery.prevTime = performance.now();
  
      Gallery.initialRender = true;
      
      Gallery.scene.fog = new THREE.FogExp2(0x666666, 0.025);
  
      Gallery.renderer.setSize(window.innerWidth, window.innerHeight);
      Gallery.renderer.setClearColor(0xffffff, 1);
      document.body.appendChild(Gallery.renderer.domElement);
  
      Gallery.userBoxGeo = new THREE.BoxGeometry(2, 1, 2);
      Gallery.userBoxMat = new THREE.MeshBasicMaterial({ color: 0xeeee99, wireframe: true });
      Gallery.user = new THREE.Mesh(Gallery.userBoxGeo, Gallery.userBoxMat);
  
      var texture = Gallery.textureLoader.load('./asset/volume.png');
      texture.minFilter = THREE.LinearFilter;
      Gallery.textureAnimation = new TextureAnimator(texture, 5, 6, 30, 60);
      var img = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  
      Gallery.volumeIcon = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), img);
      Gallery.volumeIcon.overdraw = true;
  
      Gallery.volumeIconLeftWall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), img);
      Gallery.volumeIconLeftWall.overdraw = true;
      var mS = (new THREE.Matrix4()).identity();
      mS.elements[0] = -1;
      mS.elements[10] = -1;
      Gallery.volumeIconLeftWall.geometry.applyMatrix(mS);
  
      //invisible since this will solely be used to determine the size
      //of the bounding box of our boxcollider for the user
      Gallery.user.visible = false;
  
      //making Bounding Box and HelperBox
      //boundingbox is used for collisions, Helper box just makes it easier to debug 
      Gallery.user.BBox = new THREE.Box3();
  
      //make our collision object a child of the camera
      Gallery.camera.add(Gallery.user);
  
      Gallery.controls = new THREE.PointerLockControls(Gallery.camera);
      Gallery.scene.add(Gallery.controls.getObject());
  
      Gallery.pastX = Gallery.controls.getObject().position.x;
      Gallery.pastZ = Gallery.controls.getObject().position.z;
  
      Gallery.canvas = document.querySelector('canvas');
      Gallery.canvas.className = "gallery";
  
      //Clicking on either of these will start the game
      Gallery.bgMenu = document.getElementById('background_menu');
      Gallery.play = document.getElementById('play_button');
  
      //enabling/disabling menu based on pointer controls
      Gallery.menu = document.getElementById("menu");
  
      //only when pointer is locked will translation controls be allowed: Gallery.controls.enabled
      Gallery.moveVelocity = new THREE.Vector3();
      Gallery.jump = true;
      Gallery.moveForward = false;
      Gallery.moveBackward = false;
      Gallery.moveLeft = false;
      Gallery.moveRight = false;
  
      window.addEventListener('resize', function () {
          Gallery.renderer.setSize(window.innerWidth, window.innerHeight);
          Gallery.camera.aspect = window.innerWidth / window.innerHeight;
          Gallery.camera.updateProjectionMatrix();
      });
  
    },
  
    pointerControls: function () {
        if ('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document) {
            //assign the API functions for pointer lock based on browser
            Gallery.canvas.requestPointerLock = Gallery.canvas.requestPointerLock || Gallery.canvas.mozRequestPointerLock || Gallery.canvas.webkitRequestPointerLock;
            //run this function to escape pointer Lock
            Gallery.canvas.exitPointerLock = Gallery.canvas.exitPointerLock || Gallery.canvas.mozExitPointerLock || Gallery.canvas.webkitExitPointerLock;
  
            document.addEventListener("keydown", function (e) {
              if (e.keyCode === 102 || e.keyCode === 70) {
                Gallery.toggleFullscreen();
                //refer to below event listener:
                Gallery.canvas.requestPointerLock();
              }
            });
  
            Gallery.bgMenu.addEventListener("click", function () {
                Gallery.canvas.requestPointerLock();
            });
            Gallery.play.addEventListener("click", function () {
                Gallery.canvas.requestPointerLock();
            });
  
            //pointer lock state change listener
            document.addEventListener('pointerlockchange', Gallery.changeCallback, false);
            document.addEventListener('mozpointerlockchange', Gallery.changeCallback, false);
            document.addEventListener('webkitpointerlockchange', Gallery.changeCallback, false);
  
            document.addEventListener('pointerlockerror', Gallery.errorCallback, false);
            document.addEventListener('mozpointerlockerror', Gallery.errorCallback, false);
            document.addEventListener('webkitpointerlockerror', Gallery.errorCallback, false);
  
  
        } else {
            alert("Your browser does not support the Pointer Lock API");
        }
    },
  
    changeCallback: function (event) {
      if (document.pointerLockElement === Gallery.canvas || document.mozPointerLockElement === Gallery.canvas || document.webkitPointerLockElement === Gallery.canvas) {
        Gallery.controls.enabled = true;
        Gallery.menu.className += " hide";
        Gallery.bgMenu.className += " hide";
        document.addEventListener("mousemove", Gallery.moveCallback, false);
        Gallery.sound.play();
      } else {
          Gallery.sound.pause();
        Gallery.controls.enabled = false;
        Gallery.menu.className = Gallery.menu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
        Gallery.bgMenu.className = Gallery.bgMenu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
        document.removeEventListener("mousemove", Gallery.moveCallback, false);
      }
    },
  
    errorCallback: function (event) {
        alert("Pointer Lock Failed");
    },
    moveCallback: function (event) {
        //now that pointer disabled, we get the movement in x and y pos of the mouse
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    },
    toggleFullscreen: function () {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
    },
   
  };
  
  Gallery.raycastSetUp();
  Gallery.boot();
  Gallery.pointerControls();
  
  
  
  
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
  