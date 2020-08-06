/* eslint-disable no-undef */
import * as THREE from "three";
import * as CANNON from "cannon-es";

export default class ObjBase{
    
    constructor( data ){
        this.pos = new THREE.Vector3();
        this.type = data.type;
        this.seedRand = data.seedRand;
        this.mass = 0;
        this.clock = new THREE.Clock();

        this.skill = {
            skillDrop: null,
            use: false,
            clock: new THREE.Clock,
            obj: null,
            geometry: null,
            inUse: false,
            delay: this.getRandomInt( 5000, 10000 )
        }

        this.xyz = data.xyz;
        this.geometry = null;

        this.init();
        
    }

    init(){
        
        this.getType( );
        
    }

    getType( ){
        if ( this.type === "slime" ) this.renderSlime( );
        if ( this.type === "tower" ) this.renderTower( );
    }

    renderSlime(){
        //threeJS Section
        this.geometry = new THREE.BoxBufferGeometry(this.xyz.x,this.xyz.y,this.xyz.z);
        this.geometry.rotateX( Math.PI * 0.5 );
        
        let obj = this.objObject = new THREE.Mesh(this.geometry, new THREE.MeshPhongMaterial({color: 0x44ff22,opacity:0.75,transparent:true}));

        obj.up = new THREE.Vector3(0,0,1);
        
        obj.castShadow = true;
        obj.receiveShadow = true;
        
        obj.userData.type = "slime";
    }

    renderTower( ){
        //threeJS Section
        let r = this.xyz.x / 3;
        this.geometry = new THREE.CylinderBufferGeometry(r,r,this.xyz.y,32);
        this.geometry.rotateX( Math.PI * 0.5 );
        
        let obj = this.objObject = new THREE.Mesh(this.geometry, new THREE.MeshPhongMaterial({color: 0xff0022,opacity:0.75,transparent:true}));

        obj.up = new THREE.Vector3(0,0,1);
        
        obj.castShadow = true;
        obj.receiveShadow = true;

        obj.userData.type = "tower";

        this.skill.geometry = new THREE.SphereBufferGeometry( 1 );
        this.skill.obj = new THREE.Mesh( this.skill.geometry, new THREE.MeshPhongMaterial( { color: 0x0000ff } ) );//, opacity:1.0, transparent:true } ) );

        this.skill.obj.userData.type = "skill";
        this.skill.obj.userData.damage = -10;
        this.skill.obj.userData.bounce = -2000;
        obj.add( this.skill.obj );
    }

    towerFire( ){
        let t = this.skill.clock.getElapsedTime( );

        if ( t < ( this.skill.delay / 1000 ) ){

            if ( t >= 1 ){
                //this.skillClock = new THREE.Clock;
                this.skill.obj.scale.set(1,1,1)
                //this.skill.obj.visible = false;
            } else {
                //console.log( "blip", t );

                let ym = 750;
                let k = 2;
                let n = ym - ( ym * Math.exp( -k * t ) );
                this.skill.obj.scale.x = n;
                this.skill.obj.scale.y = n;
                this.skill.obj.scale.z = n;
            }

        } else {
            this.skill.clock = new THREE.Clock;
            this.skill.obj.scale.set(1,1,1);
            //this.skill.geometry.visible = false;
        }
    }

    objRenderLoop( ){
        this.towerFire( );
    }


    getRandomInt(min, max) {
        
        min = Math.ceil(min);
        max = Math.floor(max);
        let z = Math.floor(this.seedRand() * (max - min + 1)) + min;
        return (z === 0) ? 1 : z;
    }

    randomSpherePoint(radius){
        let u = this.seedRand();
        let v = this.seedRand();
        let theta = 2 * Math.PI * u;
        let phi = Math.acos(2 * v - 1);
        return new THREE.Spherical(radius,phi,theta)
    }
}