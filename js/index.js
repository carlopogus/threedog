var app;

(function(){

  function App() {

    this.scene;
    this.camera;
    this.renderer;
    this.controls;
    this.lights = {};
    this.lightHelper;
    this.shadowCameraHelper;
    this.geometry;
    this.material;
    this.doghouse;
    this.ballRadius = 50;

    this.createBall = function(radius, color) {
      var geometry = new THREE.SphereGeometry( radius, 32, 32 );
      var material = new THREE.MeshLambertMaterial({color: color});
      var sphere = new THREE.Mesh( geometry, material );
      sphere.castShadow = true;
      return sphere;
    };

    this.createPlane = function(width, height, color) {
      var geometry = new THREE.PlaneGeometry( width, height, 32 );
      var material = new THREE.MeshPhongMaterial( { color: color, dithering: true } );
      var plane = new THREE.Mesh( geometry, material );
      plane.receiveShadow = true;
      return plane;
    }

    this.createFloor = function() {
      var floor = this.createPlane(10000, 10000, 0x808080);
      floor.rotation.x = -90 * Math.PI / 180;
      floor.position.y = -460;
      this.floor = floor;
      this.scene.add( floor );
    };

    this.createScene = function() {
      var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
      renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      document.body.appendChild( renderer.domElement );
      this.renderer = renderer;
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.Fog( 0x000000, 3500, 15000 );
      this.scene.fog.color.setHSL( 0.51, 0.4, 0.01 );
      this.renderer.setClearColor( this.scene.fog.color );
    }

    this.createCamera = function() {
      var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.x = 0;
      camera.position.y = 500;
      camera.position.z = 1200;
      this.camera = camera;
    }

    this.createHelper = function() {
      var lightHelper = new THREE.SpotLightHelper( this.lights.spotLight );
      this.scene.add( lightHelper );
      this.lightHelper = lightHelper;
      var shadowCameraHelper = new THREE.CameraHelper( this.lights.spotLight.shadow.camera );
      this.scene.add( shadowCameraHelper );
      this.shadowCameraHelper = shadowCameraHelper;
      this.scene.add( new THREE.AxisHelper( 10 ) );
    }

    this.createControls = function() {
      var controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
      controls.enableZoom = true;
      controls.autoRotate = true;
      this.controls = controls;
    }

    this.createLight = function() {
      var ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
      this.scene.add( ambient );
      this.lights.ambient = ambient;

      var spotLight = new THREE.SpotLight( 0xffffff, 1 );
      spotLight.position.set( 0, 1000, 2000 );
      spotLight.angle = Math.PI / 4;
      spotLight.penumbra = 0.25;
      spotLight.decay = 2;
      spotLight.distance = 7000;
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;
      spotLight.shadow.camera.near = 10;
      spotLight.shadow.camera.far = 200;
      this.addFlare(spotLight);
      this.scene.add( spotLight );
      this.lights.spotLight = spotLight;

    }

    this.addFlare = function( light ) {
      var textureLoader = new THREE.TextureLoader();
      var textureFlare0 = textureLoader.load( "images/lensflare/lensflare0.png" );
      var textureFlare2 = textureLoader.load( "images/lensflare/lensflare2.png" );
      var textureFlare3 = textureLoader.load( "images/lensflare/lensflare3.png" );

      var flareColor = new THREE.Color( 0xffffff );
      flareColor.setRGB( light.color.r, light.color.g, light.color.b );
      var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );
      lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
      lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
      lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
      lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
      lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
      lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
      lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );
      lensFlare.customUpdateCallback = this.lensFlareUpdateCallback;
      lensFlare.position.copy( light.position );
      this.scene.add( lensFlare );
    }

    this.lensFlareUpdateCallback = function( object ) {
      var f, fl = object.lensFlares.length;
      var flare;
      var vecX = -object.positionScreen.x * 2;
      var vecY = -object.positionScreen.y * 2;
      for( f = 0; f < fl; f++ ) {
        flare = object.lensFlares[ f ];
        flare.x = object.positionScreen.x + vecX * flare.distance;
        flare.y = object.positionScreen.y + vecY * flare.distance;
        flare.rotation = 0;
      }
      object.lensFlares[ 2 ].y += 0.025;
      object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
    }

    this.createDoghouse = function() {
      var doghouse = new THREE.Group();
      var doghouseMap = [1,6,7,3,3,3,7,6,1];
      var gap = 20;
      var radius = 50;
      var color = 0xCC0000;
      var diameter = radius * 2;
      var middle = Math.round(doghouseMap.length / 2);
      var largest = Math.max.apply(Math, doghouseMap);

      for (var i = 0; i < doghouseMap.length; i++) {
        var xOffset = (i + 1) - middle;
        var yStartOffset = radius * (Math.abs(xOffset) * -1);

        for (var count = 0; count < doghouseMap[i]; count++) {
          var ball = this.createBall(radius, color);
          doghouse.add( ball );
          ball.position.x = (diameter + gap) * (xOffset);
          ball.position.y = yStartOffset - ((diameter + gap) * count);
        }
      }

      var box = new THREE.Box3().setFromObject(doghouse);
      var dhHeight = box.getSize().y;
      doghouse.position.y = (dhHeight / 2);
      this.scene.add(doghouse);
      this.doghouse = doghouse;
    }

    this.init = function() {
      this.createScene();
      this.createLight();
      this.createDoghouse();
      this.createFloor();
      this.createCamera();
      this.createControls();
      this.animate();
      window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    this.onWindowResize = function() {
      var HEIGHT = window.innerHeight;
      var WIDTH = window.innerWidth;
      this.renderer.setSize(WIDTH, HEIGHT);
      this.camera.aspect = WIDTH / HEIGHT;
      this.camera.updateProjectionMatrix();
    }

    this.animate = function() {
      requestAnimationFrame(this.animate.bind(this));
      this.controls.update();
      this.renderer.render( this.scene, this.camera );
    }

  };

  app = new App();
  app.init();

})();
