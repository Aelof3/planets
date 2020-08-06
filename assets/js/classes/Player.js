/* eslint-disable no-undef */
import * as THREE from "three";
import * as CANNON from "cannon-es";
import ModelLoader from './ModelLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export default class Player{
    
    constructor( data ){
        this.pos = { x: 0, y: data.globeRadius + 20, z: 0 };
        this.posy = new THREE.Vector3( 0, data.globeRadius + 20, 0 );
        this.quat = { x: 0, y: 0, z: 0, w: 1 };
        this.mass = 1;
        this.planets = data.planets;
        this.camera = data.camera;
        this.tempcamera = null;
        this.axesHelper = null;
        this.controls = null;
        this.damageDelay = true;
        this.menu = false;
        this.dead = false;
        this.playerObject = null;
        this.globeRadius = data.globeRadius;
        this.oldquat = new THREE.Quaternion( );
        this.playerTimer = null;
        this.playerStartTime = Date.now( );

        this.skill = {
            skillDrop: null,
            use: false,
            clock: new THREE.Clock,
            obj: null,
            geometry: null,
            inUse: false
        }

        this.scene = data.scene;
        this.attributes = {
            health: {
                amount:100,
                regen: true,
                modifier: 1
            },
            energy: {
                amount:100,
                regen: true,
                modifier: 1
            },
            defense:  {
                amount:100,
                modifier: 1
            },
            speed:  {
                amount:100,
                modifier: 1
            },
            damage:  {
                amount:100,
                modifier: 1
            },
            gravity: {
                modifier: 1
            },
            bounce: {
                modifier: 1
            }
        };
        this.moveDirection = { 
            left: 0,
            right: 0, 
            forward: 0, 
            back: 0, 
            jump: 0, 
            strafeRight: 0, 
            strafeLeft: 0, 
            dive: 0,
            dash: 0
        };

        this.closestDist = null;
        this.closestPlanet = { number:0, planet:this.planets[0] };
        this.nq = new THREE.Object3D( );
        this.raycasterX = null;
        this.raycasterY = null;
        this.raycasterZ = null;
        this.clock = new THREE.Clock( );

        this.jumps = 2;
        this.dashes = 1;
        
        this.prevTime = Date.now( );
        this.amirotating = false;

        this.isMoving = false;

        this.modelsloaded = 1;
        this.avatar = null;

        this.renderer = data.renderer;
        this.init( );
        
    }

    init( ){
        
        //threeJS Section
        this.playerGeometry = new THREE.BoxBufferGeometry( 15, 15, 15 );
        this.playerGeometry.rotateX( Math.PI * 0.5 );
        
        let player = this.playerObject = new THREE.Mesh( this.playerGeometry, new THREE.MeshPhongMaterial( { color: 0xff0505, opacity:0.0, transparent:true } ) );

        this.oldquat.copy( this.playerObject.getWorldQuaternion( ) );

        //player.up = new THREE.Vector3( -1, -1, -1 );
        player.position.set( this.pos.x, this.pos.y, this.pos.z );
        
        let light = new THREE.AmbientLight( 0x404040 );
        light.intensity = 0.5;
        
        player.add( light );

        player.castShadow = true;
        player.receiveShadow = true;

        window.scene.add( player );
        
        player.add( this.camera );
        //this.axesHelper = new THREE.AxesHelper( 5000 );
        //player.add( this.axesHelper );

        this.skill.geometry = new THREE.SphereBufferGeometry( 1 );
        this.skill.obj = new THREE.Mesh( this.skill.geometry, new THREE.MeshPhongMaterial( { color: 0xff0505 } ) );//, opacity:1.0, transparent:true } ) );
        this.skill.obj.position.set(0,0,-50);

        player.add( this.skill.obj );


        let originVector = this.playerObject.getWorldPosition( );
        let directionVectorX = new THREE.Vector3( this.playerObject.matrixWorld.elements[0], this.playerObject.matrixWorld.elements[1], this.playerObject.matrixWorld.elements[2] );
        let directionVectorY = new THREE.Vector3( this.playerObject.matrixWorld.elements[4], this.playerObject.matrixWorld.elements[5], this.playerObject.matrixWorld.elements[6] );
        let directionVectorZ = new THREE.Vector3( this.playerObject.matrixWorld.elements[8], this.playerObject.matrixWorld.elements[9], this.playerObject.matrixWorld.elements[10] );
        let directionVectorXn = new THREE.Vector3( );
        directionVectorXn.copy( directionVectorX ).negate( );
        let directionVectorYn = new THREE.Vector3( );
        directionVectorYn.copy( directionVectorY ).negate( );

        this.raycasterX = new THREE.Raycaster( originVector, directionVectorX, 0, 30 );
        this.raycasterY = new THREE.Raycaster( originVector, directionVectorY, 0, 30 );
        this.raycasterZ = new THREE.Raycaster( originVector, directionVectorZ, 0, 30 );

        this.raycasterXn = new THREE.Raycaster( originVector, directionVectorXn, 0, 30 );
        this.raycasterYn = new THREE.Raycaster( originVector, directionVectorYn, 0, 30 );
        
        // find distance to closest planet, which we set to be the first planet in the planets array
        // absolite value in case distance is negative for some reason
        let closestDistCenter = Math.abs( this.playerObject.position.distanceTo( this.closestPlanet.planet.globeObject.getWorldPosition( ) ) );

        // subtract globe radius from the distance to planet, to get close to 0 if standing on surface.
        this.closestDist = closestDistCenter - this.closestPlanet.planet.globeRadius;
        
        //this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        //this.controls.autoRotate = false;

        this.camera.position.set( 0, 100, -1200 );
        this.camera.lookAt( this.playerObject.getWorldPosition( ) );
        //this.camera.rotateZ( this.toRad( 180 ) );


        /////////////////////////////////////////////////////
        // TRICKY BIT TO SET ORBITCONTROLS PARENT TO NULL  //
        /////////////////////////////////////////////////////
        this.tempcamera = this.camera.clone();
        
        this.controls = new OrbitControls( this.tempcamera, this.renderer.domElement );

        /////////////////////////////////////////////////////

        this.physicsBody = new CANNON.Body({
            mass: this.mass, // kg
            position: new CANNON.Vec3( this.pos.x, this.pos.y, this.pos.z ), // m
            shape: new CANNON.Box( new CANNON.Vec3( 15, 15, 15 ) ),
            velocity: new CANNON.Vec3( 0,0,0 ),
            angularVelocity: new CANNON.Vec3( 0,0,0 ),
            linearDamping: 0.85,
            angularDamping: 0.15,
            restitution:0
        });
        
        let data = {
            model: window.globeAPPsettings.character,
            color: window.globeAPPsettings.color
        }
        this.avatar = new ModelLoader( data, this.playerObject, ( )=>{ return false; } );

        this.setupEventHandlers( );
    }

    setupEventHandlers( ){
        
        window.addEventListener( 'keydown', ( e )=>{ this.handleKeyDown( e ) }, false );
        window.addEventListener( 'keyup', ( e )=>{ this.handleKeyUp( e ) }, false );

    }
    
    handleKeyDown( event ){
        

        let keyCode = event.key;
        //console.log(event, keyCode, this.getKeyCode(event.key));

        switch(keyCode){
            //case "1": //FORWARD
            //  this.skill.use = true;
            //  break;
            
            case window.globeAPPsettings.options.controls.forward: //FORWARD
                this.moveDirection.forward = 1;
                break;
                
            case window.globeAPPsettings.options.controls.backwards: //BACK
                this.moveDirection.back = 1;
                break;
                
            case window.globeAPPsettings.options.controls.turnleft: //LEFT
                this.moveDirection.left = 1;
                break;
                
            case window.globeAPPsettings.options.controls.turnright: //RIGHT
                this.moveDirection.right = 1;
                break;
                
            case window.globeAPPsettings.options.controls.jump: //SPACE: JUMP
                this.moveDirection.jump = 1;
                break;

            case window.globeAPPsettings.options.controls.strafeleft: //E: STRAFE LEFT
                this.moveDirection.strafeLeft = 1;
                break;

            case window.globeAPPsettings.options.controls.straferight: //Q: STRAFE RIGHT
                this.moveDirection.strafeRight = 1;
                break;

            case window.globeAPPsettings.options.controls.dive: //Z: DIVE
                this.moveDirection.dive = 1;
                break;

            case window.globeAPPsettings.options.controls.dash: //F: DASH
                this.moveDirection.dash = 1;
                break;
        }
    }
    
    
    handleKeyUp( event ){
        

        let keyCode = event.key;

        switch(keyCode){
            //case "1": //FORWARD
            //    this.skill.use = false;
            //    break;
                
            case window.globeAPPsettings.options.controls.forward: //FORWARD
                this.moveDirection.forward = 0;
                break;
                
            case window.globeAPPsettings.options.controls.backwards: //BACK
                this.moveDirection.back = 0;
                break;
                
            case window.globeAPPsettings.options.controls.turnleft: //LEFT
                this.moveDirection.left = 0;
                break;
                
            case window.globeAPPsettings.options.controls.turnright: //RIGHT
                this.moveDirection.right = 0;
                break;
                
            case window.globeAPPsettings.options.controls.jump: //SPACE: JUMP
                this.moveDirection.jump = 0;
                break;

            case window.globeAPPsettings.options.controls.strafeleft: //E: STRAFE LEFT
                this.moveDirection.strafeLeft = 0;
                break;

            case window.globeAPPsettings.options.controls.straferight: //Q: STRAFE RIGHT
                this.moveDirection.strafeRight = 0;
                break;

            case window.globeAPPsettings.options.controls.dive: //Z: DIVE
                this.moveDirection.dive = 0;
                break;

            case window.globeAPPsettings.options.controls.dash: //F: DASH
                this.moveDirection.dash = 0;
                break;
        }
    }
    
    toRad(degrees){
        let pi = Math.PI;
        return degrees * (pi/180);
    }

    regenAttributes( ){
        
        if ( this.dead ) return;
        // energy
        if ( this.attributes.energy.amount < 100 && this.attributes.energy.regen ){
            this.attributes.energy.regen = false;
            this.attributes.energy.amount += 1;
            setTimeout( ( )=>{ this.attributes.energy.regen = true; }, 150 );
        }

        // health
        if ( this.attributes.health.amount < 100 && this.attributes.health.regen ){
            this.attributes.health.regen = false;
            this.attributes.health.amount += 1;
            setTimeout( ( )=>{ this.attributes.health.regen = true; }, 500 );
        }
    }
    
    movePlayer( ){
        
        if ( this.dead ) return;
        
        let moveX =  this.moveDirection.right - this.moveDirection.left;
        let strafe =  10 * ( this.moveDirection.strafeRight - this.moveDirection.strafeLeft );
        let moveY =  10 * ( this.moveDirection.back - this.moveDirection.forward );
        let moveZ =  this.moveDirection.jump;
        let dive =  this.moveDirection.dive;
        let dash =  this.moveDirection.dash;

        if( moveX === 0 && moveY === 0 && moveZ === 0 && strafe === 0 && dive === 0 && dash === 0 ) {
            this.isMoving = false;
            this.avatar.animateMe( 'Idle' );
            
            return;
        }

        if ( this.playerTimer === null ) this.playerTimer = new THREE.Clock;

        this.isMoving = true;

        let rI = new THREE.Vector3( strafe, moveY, 0 );
        
        let resultantImpulse = new CANNON.Vec3( rI.x,rI.y,rI.z );
        
        if ( moveZ === 1 && this.closestDist < 50 ) {

            this.playerJump();
            this.avatar.animateMe( 'Jump' );
            
        } else if ( dive === 1 && this.closestDist > 225 ){
            this.playerDive( );
            this.avatar.animateMe( 'Sitting' );
        } else {
            this.avatar.animateMe( 'Running' );
        }
        
        if ( dash === 1 && this.attributes.energy.amount >= 20 ){
            this.playerDash( );
        }

        this.physicsBody.applyLocalImpulse( resultantImpulse, new CANNON.Vec3(0,0,0) );
        
    }

    playerJump( ){
        

        if ( this.jumps > 0  && this.closestDist < 50 ){
            this.jumps -= 1;
            setTimeout( ( )=>{ this.jumps++ }, 1000 );
            let rI = new THREE.Vector3( 0, 0, -1200 );

            let resultantImpulse = new CANNON.Vec3( rI.x,rI.y,rI.z );
            this.physicsBody.applyLocalImpulse( resultantImpulse, new CANNON.Vec3( 0, 0, 0 ) );
        }
    }

    playerDash( ){
        // 20 energy
        

        if ( this.dashes > 0 ){
            this.dashes = this.dashes - 1;
            setTimeout( ( )=>{ this.dashes++ }, 500 );
            let rI = new THREE.Vector3( 0, -2400, 0 );
            this.changeStat( 'energy', -20 );

            let resultantImpulse = new CANNON.Vec3( rI.x,rI.y,rI.z );
            this.physicsBody.applyLocalImpulse( resultantImpulse, new CANNON.Vec3( 0, 0, 0 ) );
        }
    }
    
    playerDive( ){
        

        let rI = new THREE.Vector3( 0, 0, 700 );

        let resultantImpulse = new CANNON.Vec3( rI.x,rI.y,rI.z );
        this.physicsBody.applyLocalImpulse( resultantImpulse, new CANNON.Vec3( 0, 0, 0 ) );
    }

    playerBounce( x, y, z ){
        if ( typeof x != "number" || typeof y != "number"|| typeof z != "number") return;
        let bm = this.attributes.bounce.modifier;
        let bmx = bm * x;
        let bmy = bm * y;
        let bmz = bm * z;
        //console.log(bmx,bmy,bmz)
        let rI = new THREE.Vector3( bmx, bmy, bmz );
        //let rI = new THREE.Vector3( x, y, z );
        //console.log(rI)
        let resultantImpulse = new CANNON.Vec3( rI.x,rI.y,rI.z );
        this.physicsBody.applyLocalImpulse( resultantImpulse, new CANNON.Vec3( 0, 0, 0 ) );
        
    }

    playerTurn( ){

        if ( this.dead ) return;
        
        let moveX =  this.moveDirection.right - this.moveDirection.left;
        if ( moveX != 0 ){
            this.playerObject.rotateZ( this.toRad( 3.5 * moveX ) );
            this.playerObject.quaternion.multiply( this.oldquat );
            
            this.playerObject.updateMatrixWorld( );
        }
    }

    getDistanceToPlanets( ){
        
        let cdC = this.playerObject.position.distanceTo( this.closestPlanet.planet.globeObject.getWorldPosition( ) );
        this.closestDist = cdC - this.closestPlanet.planet.globeRadius;
        for ( let i=0;i<this.planets.length;i++ ){
            let planet = this.planets[i];
            let distToCenter = this.playerObject.position.distanceTo( planet.globeObject.getWorldPosition( ) );
            let dist = distToCenter - planet.globeRadius;
            if ( dist < this.closestDist && i !== this.closestPlanet.number ){
                this.closestPlanet = { number:i, planet:this.planets[i] };
                this.amirotating = true;
            }

        }
    }

    faceGlobe( ){
        

        let rotationMatrix = new THREE.Matrix4( ).extractRotation( this.playerObject.matrixWorld );
        let up1 = new THREE.Vector3( 0, 1, 0 ).applyMatrix4( rotationMatrix ).normalize( );
        this.playerObject.up.copy(up1);

        if ( this.amirotating === false ){
            this.playerObject.lookAt( this.closestPlanet.planet.globeObject.getWorldPosition( ) );
        } else {

            //this.physicsBody.velocity.set(0,0,0);
            this.nq.position.copy( this.playerObject.position );

            if ( this.nq.quaternion.normalize( ).equals( this.playerObject.quaternion.normalize( ) ) ){
                this.amirotating = false;
            } else {
                this.nq.lookAt( this.closestPlanet.planet.globeObject.getWorldPosition( ) );
                this.playerObject.quaternion.slerp( this.nq.quaternion, 0.1 );
                setTimeout( ( )=>{ this.amirotating = false }, 750 );
            }
        }
    }

    gravPlayer( ){
        
        let gravityDefault = 2500;

        let gravity = gravityDefault;

        if ( window.globeAPPsettings.difficulty === "insanity" ) gravity = gravityDefault * this.attributes.gravity.modifier;

        let rI = new THREE.Vector3( 0, 0, gravity );

        if ( this.amirotating ){
            rI.copy( new THREE.Vector3( 0, 0, 200 ) );    
        }
        
        
        let resultantImpulse = new CANNON.Vec3( rI.x,rI.y,rI.z );
        
        this.physicsBody.applyLocalForce( resultantImpulse, new CANNON.Vec3( 0, 0, 0 ) );
        
    }

    findIntersection( ){
        
        
        let originVector = this.playerObject.getWorldPosition( );
        
        let directionVectorX = new THREE.Vector3( this.playerObject.matrixWorld.elements[0], this.playerObject.matrixWorld.elements[1], this.playerObject.matrixWorld.elements[2] );
        let directionVectorY = new THREE.Vector3( this.playerObject.matrixWorld.elements[4], this.playerObject.matrixWorld.elements[5], this.playerObject.matrixWorld.elements[6] );
        let directionVectorZ = new THREE.Vector3( this.playerObject.matrixWorld.elements[8], this.playerObject.matrixWorld.elements[9], this.playerObject.matrixWorld.elements[10] );
        let directionVectorXn = new THREE.Vector3( );
        directionVectorXn.copy( directionVectorX ).negate( );
        let directionVectorYn = new THREE.Vector3( );
        directionVectorYn.copy( directionVectorY ).negate( );
        
        this.raycasterX.set( originVector, directionVectorX );
        this.raycasterY.set( originVector, directionVectorY );
        this.raycasterZ.set( originVector, directionVectorZ );
        
        this.raycasterXn.set( originVector, directionVectorXn );
        this.raycasterYn.set( originVector, directionVectorYn );

        for ( let i=0;i<this.closestPlanet.planet.objectList.length;i++ ){
            let intersectX = this.raycasterX.intersectObject( this.closestPlanet.planet.objectList[i].objObject, true );
            let intersectY = this.raycasterY.intersectObject( this.closestPlanet.planet.objectList[i].objObject, true );
            let intersectZ = this.raycasterZ.intersectObject( this.closestPlanet.planet.objectList[i].objObject, true );

            let intersectXn = this.raycasterXn.intersectObject( this.closestPlanet.planet.objectList[i].objObject, true );
            let intersectYn = this.raycasterYn.intersectObject( this.closestPlanet.planet.objectList[i].objObject, true );

            if ( intersectX.length > 0 || intersectY.length > 0 || intersectZ.length > 0 ) {
                //console.log( intersectX, intersectY, intersectZ );
                this.playerBounce( );
                if ( intersectX.length > 0 ) { 
                    if ( intersectX[0].object.userData.type === "skill" ){
                        this.changeStat( 'health', intersectX[0].object.userData.damage );
                        this.playerBounce( intersectX[0].object.userData.bounce, 0, 0 );
                    } else {
                        this.changeStat( 'health', -20 );
                        this.playerBounce( -2000, 0, 0 );
                    }
                }
                if ( intersectY.length > 0 ) { 
                    if ( intersectY[0].object.userData.type === "skill" ){
                        this.changeStat( 'health', intersectY[0].object.userData.damage );
                        this.playerBounce( 0, intersectY[0].object.userData.bounce, 0 );
                    } else {
                        this.changeStat( 'health', -20 );
                        this.playerBounce( 0, -2000, 0 );
                    }
                }
                if ( intersectZ.length > 0 ) { 
                    // only deletes the slime if hit from the top -- if uncommented
                    if ( intersectZ[0].object.userData.type === "skill" ){
                        this.changeStat( 'health', intersectZ[0].object.userData.damage );
                        this.playerBounce( 0, 0, intersectZ[0].object.userData.bounce );
                    } else {
                        this.playerBounce( 0, 0, -2000 );
                        this.killSlime( i );
                    }
                    
                }
            }

            if ( intersectXn.length > 0 || intersectYn.length > 0 ) {
                //console.log( intersectX, intersectY, intersectZ );
                this.playerBounce( );
                if ( intersectXn.length > 0 ) { 
                    if ( intersectXn[0].object.userData.type === "skill" ){
                        this.changeStat( 'health', intersectXn[0].object.userData.damage );
                        this.playerBounce( intersectXn[0].object.userData.bounce, 0, 0 );
                    } else {
                        this.changeStat( 'health', -20 );
                        this.playerBounce( 2000, 0, 0 );
                    }
                }
                if ( intersectYn.length > 0 ) { 
                    if ( intersectYn[0].object.userData.type === "skill" ){
                        this.changeStat( 'health', intersectYn[0].object.userData.damage );
                        this.playerBounce( 0, intersectYn[0].object.userData.bounce, 0 );
                    } else {
                        this.changeStat( 'health', -20 );
                        this.playerBounce( 0, 2000, 0 );
                    }
                }
            }
        }
    }

    killSlime( i ){
        this.closestPlanet.planet.globeObject.remove( this.closestPlanet.planet.objectList[i].objObject );
        this.closestPlanet.planet.objectList.splice( i, 1 );
    }

    skillUse( ){
        let t = this.skill.clock.getElapsedTime( );
        if ( !this.skill.inUse && this.skill.use ){
            this.skill.inUse = true;
            
            setTimeout( ( )=>{
                this.skill.inUse = false;
            }, 250);
        
        } else if ( this.skill.inUse ){

            if ( t >= 0.25 ){
                //this.skillClock = new THREE.Clock;
                this.skill.obj.scale.set(0,0,0)
                this.skill.obj.position.set(0,0,-50);
                this.skill.obj.visible = false;
            } else {
                this.skill.obj.visible = true;
                let ym = 75;
                let k = 5;
                this.skill.obj.scale.x = ym - ( ym * Math.exp( -k * t ) );
                this.skill.obj.scale.y = ym - ( ym * Math.exp( -k * t ) );
                this.skill.obj.scale.z = ym - ( ym * Math.exp( -k * t ) );
                this.skill.obj.position.y -= ( t * 500 );
            }

        } else {
            this.skill.clock = new THREE.Clock;
            this.skill.obj.scale.set(0,0,0);
            this.skill.obj.position.set(0,0,-50);
            this.skill.geometry.visible = false;
        }
    }

    changeStat( stat, amount, checkEnough ){
        if ( checkEnough && this.attributes[stat].amount < Math.abs( amount ) ) return false;

        if ( this.damageDelay && stat === "health" ){
            
            this.damageDelay = false;
            
            if ( window.globeAPPsettings.difficulty === "insanity" ) {
                this.attributes.gravity.modifier += -0.1;
                this.attributes.bounce.modifier += 0.1;
            }
            
            setTimeout( ( )=>{
                this.damageDelay = true;
            }, 100);

            this.attributes[stat].amount += amount;
        } else {
            this.attributes[stat].amount += amount;
        }

    }

    healthCheck( ){
        if ( this.attributes.health.amount < 1 ){
            this.dead = true;
            this.deathHandler();
        }
    }

    deathHandler( ){
        if ( this.avatar.model === 'robot' ){
            this.avatar.animateMe( 'Death' );
        } else if ( this.avatar.model === 'alien' ){
            this.avatar.animateMe( 'TPose' );
        }

        if ( this.playerTimer !== null ) {
            this.playerTimer.stop();
        }

        if ( !this.menu ){
            this.menu = true;
            window.globeapp.stateChange( 'menu' );
        }
        
    }

    globeLoop( ){
        for ( let i=0;i<this.closestPlanet.planet.objectList.length;i++){
            if (this.closestPlanet.planet.objectList[i].objObject.userData.type === "tower"){
                this.closestPlanet.planet.objectList[i].objRenderLoop( );
            }
        }
        
    }

    loop( ){
        
        //this.controls.update();

        if ( this.controls && this.playerObject ) {
            this.camera.copy(this.tempcamera);
            this.controls.update();
        }

        this.globeLoop( );

        this.healthCheck( );

        this.skillUse( );

        this.physicsBody.quaternion.copy( this.playerObject.quaternion );
        this.playerObject.position.copy( this.physicsBody.position );
    
        this.regenAttributes( );
        this.getDistanceToPlanets( );
        this.findIntersection( );
        this.playerObject.updateMatrixWorld();

        let dt = this.clock.getDelta();
        if ( this.avatar.modelObj.mixer ) this.avatar.modelObj.mixer.update( dt );

        this.movePlayer( );
        this.faceGlobe( );
        this.playerTurn( );
        this.gravPlayer( );

    }

    h2e( html ) {
        // Turn text html into an element node, use is similar to jQuery $('<div class="jqueryclass"></div>') to create element
        let template = document.createElement( 'template' );
        html = html.trim( ); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

}