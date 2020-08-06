/* eslint-disable no-undef */
import * as THREE from "three";
import * as CANNON from "cannon-es";
import Player from "./Player.js";
import Globe from "./Globe.js";
import SeedRandom from 'seedrandom';
import Gui from './Gui.js';

export default class GameState {

    constructor( ){

        this.gui = null;

        this.seedRand = new SeedRandom( window.globeAPPsettings.seed );
        
        this.scene = null;
        this.camera = null;
        this.tempcamera = null;
        this.controls = null;
        this.renderer = null;
        
        this.world = null;
        
        this.planets = [];
        this.globe = null;

        this.objBase = null;
        this.objPos = null;
        this.objectList = [];
        
        this.player = null;
        this.playerLight = null;
        this.playerObject = null;
        
        this.renderFunctions = [];

        this.tmpTrans = null;
        this.tmpPos = new THREE.Vector3();
        this.tmpQuat = new THREE.Quaternion();

        this.mouseCoords = new THREE.Vector2();

        this.raycaster = new THREE.Raycaster();
        
        this.deltaTime = null;
        this.clock = new THREE.Clock();
        this.fixedTimeStep = 1.0 / 60.0;
        this.maxSubSteps = 3;
        
        this.STATE = { DISABLE_DEACTIVATION : 4 };
    }

    init (){
        this.setupworld();

        this.setupGraphics();

        this.setupPlanets();

        this.setupPlayer();

        window.gui = new Gui( {
            player: window.player
        } );

        this.render( );

    }

    setupPlayer( ){

        window.player = new Player( {
            planets: this.planets,
            camera: this.camera,
            globeRadius: this.planets[0].globeRadius,
            scene: window.scene,
            renderer: this.renderer
        } );

        this.world.addBody( window.player.physicsBody );

    }

    setupPlanets( ){

        let gdist = 0;
        let xyz = [0,0,0];
        let planetsCount = ( window.globeAPPsettings.planetCount > 0 ) ? window.globeAPPsettings.planetCount : 1;
        // 12 is amount of skins
        for (let i=0;i<planetsCount;i++){
            
            /*

            getting vectors for procedural planet placement

            y     THREE.Vector3( 0, gdist, 0 ) | 86: THREE.Vector3( 0, - gdist, 0 )
            -y    THREE.Vector3( 0, - gdist, 0 ) | 86: THREE.Vector3( 0, gdist, 0 )
            x     THREE.Vector3( gdist, 0, 0 ) | 86: THREE.Vector3( - gdist, 0, 0 )
            -x    THREE.Vector3( - gdist, 0, 0 ) | 86: THREE.Vector3( gdist, 0, 0 )
            z     THREE.Vector3( 0, 0, gdist ) | 86: THREE.Vector3( 0, 0, - gdist )
            -z    THREE.Vector3( 0, 0, - gdist ) | 86: THREE.Vector3( 0, 0, gdist )

            */

            let globeRadius = this.getRandomInt(580,1080);
            
            // create gap of 750 between each globe
            if ( i > 0 ) {
                gdist = 750 + globeRadius + this.planets[i - 1].globeRadius;
                        
                if ( i % 2 === 0 ){
                    let newPos = this.getRandomInt(1,4);

                    switch( newPos ){
                        case 1:
                            xyz[0] += gdist;
                            break;
                        case 2:
                            xyz[0] -= gdist;
                            break;
                        case 3:
                            xyz[2] += gdist;
                            break;
                        case 4:
                            xyz[2] -= gdist;
                            break;
                        default:
                            break;
                    } 
                } else { 
                    xyz[1] -= gdist;
                }
            }
            
            let pos = new THREE.Vector3( xyz[0], xyz[1], xyz[2] );

            let g = new Globe( {
                pos: pos,
                i: i,
                scene: window.scene,
                globeRadius: globeRadius,
                physicsBody: this.physicsBody,
                world: this.world,
                seedRand: this.seedRand
            } );
            
            this.planets.push( g );
        
            window.scene.add( g.globeObject );
            
            this.world.addBody( g.physicsBody );
    
        }
    }

    setupworld(){

        this.world = new CANNON.World();

        this.world.gravity.set(0,0,0);
        
    }

    getRandomInt(min, max) {

        min = Math.ceil(min);
        max = Math.floor(max);
        let z = Math.floor(this.seedRand() * (max - min + 1)) + min;
        return (z === 0) ? 1 : z;
    }

    setupGraphics(){

        //create the scene
        window.scene = new THREE.Scene();
        //let axesHelper = new THREE.AxesHelper( 2000 );
        //window.scene.add( axesHelper );

        window.scene.background = new THREE.Color( 0x000000 );
        window.scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );

        //create camera
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 25000 );
        this.camera.up = new THREE.Vector3( 0,0,-1);
        //Add hemisphere light
        let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
        hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
        hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
        hemiLight.position.set( 0, 50, 0 );
        window.scene.add( hemiLight );

        //Add directional light
        let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( -1, 1.75, 1 );
        dirLight.position.multiplyScalar( 100 );
        window.scene.add( dirLight );

        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        let d = 50;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 13500;

        //Setup the renderer
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor( 0xbfd1e5 );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
        
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.renderer.shadowMap.enabled = true;
        
    }

    render(){
        
        requestAnimationFrame( ()=>{
            this.render();
        } );

        if (this.world) this.world.step(this.fixedTimeStep, this.clock.getDelta(), this.maxSubSteps);
        
        if (window.player) window.player.loop();

        if (window.gui) window.gui.loop();
        
        if (this.renderer) this.renderer.render( window.scene, this.camera );
    }

}
