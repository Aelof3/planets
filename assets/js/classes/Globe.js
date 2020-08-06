/* eslint-disable no-undef */
import * as THREE from "three";
import * as CANNON from "cannon-es";
import ObjBase from "./ObjBase.js";

export default class Globe {
    constructor( data ){
        this.objectList = [];
        this.seedRand = data.seedRand;
        this.pos = data.pos;
        this.mass = 0;
        this.skins = [
            '../assets/images/ceresl.jpg',
            '../assets/images/earth.jpg',
            '../assets/images/eris.jpg',
            '../assets/images/haumea.jpg',
            '../assets/images/jupiter.jpg',
            '../assets/images/makemake.jpg',
            '../assets/images/mars.jpg',
            '../assets/images/mercury.jpg',
            '../assets/images/neptune.jpg',
            '../assets/images/saturn.jpg',
            '../assets/images/uranus.jpg',
            '../assets/images/venus.jpg'
        ];

        this.i = data.i;
        let ii = data.i % 12;
        this.skin = this.skins[ii];
        this.scene = data.scene;
        this.globeRadius = data.globeRadius;
        this.physicsBody = data.physicsBody;
        this.world = data.world;
        this.globeObject = null;
        this.population = [];

        //this.orbitPoint = new THREE.Object3D();
        //this.orbitPoint.rotation.z = this.getRandomInt(0,9) / 10;
        //this.orbitSpeed = this.getRandomInt(-1,1) / 1000;

        this.textureLoader = new THREE.TextureLoader();
        //this.textureLoader.setPath( `/globe/assets/images/` );
        this.init();
    }
    
    init(){
        

        let texture = this.textureLoader.load( this.skin );

        let globe = this.globeObject = new THREE.Mesh(new THREE.SphereBufferGeometry(this.globeRadius,40,40), new THREE.MeshPhongMaterial({map:texture}));

        globe.position.set(this.pos.x, this.pos.y, this.pos.z);
        
        globe.castShadow = true;
        globe.receiveShadow = true;

        let oA = {
            slime:20,
            tower:10
        }

        if ( window.globeAPPsettings.difficulty === "easy" ){
            oA.slime = 10;
            oA.tower = 0;
        } else if ( window.globeAPPsettings.difficulty === "medium" ){
            oA.slime = 20;
            oA.tower = 5;
        } else if (window.globeAPPsettings.difficulty === "difficult" ){
            oA.slime = 30;
            oA.tower = 10;
        }

        this.objectList = this.objSpawner( oA, this.globeRadius );

        for (let i=0;i<this.objectList.length;i++){
            globe.add( this.objectList[i].objObject );
            this.objectList[i].objObject.lookAt( globe.position );
            this.objectList[i].objObject.updateMatrixWorld();
        }

        let globeShape = new CANNON.Sphere( this.globeRadius );
        this.physicsBody = new CANNON.Body({ 
            mass: this.mass, 
            position: new CANNON.Vec3(this.pos.x, this.pos.y, this.pos.z),
            restitution:0,
            shape:globeShape
        });
        
    }

    objSpawner( oA, radius ){
        

        let arr = [];
        for ( let key in oA ){
            for( let i=0; i<oA[key]; i++ ) {
            
                let xInt = this.getRandomInt( radius / 10, radius / 2.5 );
                let yInt = this.getRandomInt( radius / 10, radius / 2.5 );
                let zInt = this.getRandomInt( radius / 10, radius / 2.5 );
    
                let obj = new ObjBase( {
                  seedRand: this.seedRand,
                  xyz: new THREE.Vector3( xInt, yInt, zInt ),
                  type: key
                } );
                //obj.scale( xInt, yInt, zInt );
                arr.push( obj );
                let pt = obj.randomSpherePoint( radius );
                obj.objObject.position.setFromSpherical( pt );
                //obj.addToPhysicsWorld( this.world );
            }    
        }
        return arr;
    }

    getRandomInt(min, max) {
        
        min = Math.ceil(min);
        max = Math.floor(max);
        let z = Math.floor(this.seedRand() * (max - min + 1)) + min;
        return (z === 0) ? 1 : z;
    }
    
    randomSpherePoint( radius ){
        
        //pick numbers between 0 and 1
        let u = this.seedRand( );
        let v = this.seedRand( );

        // create random spherical coordinate
        let theta = 2 * Math.PI * u;
        let phi = Math.acos( 2 * v - 1 );
        return new THREE.Spherical( radius, phi, theta )
    }
     
}