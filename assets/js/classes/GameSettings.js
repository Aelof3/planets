/* eslint-disable no-undef */
export default class GameSettings {
    constructor( ){
        
        this.gameTypes = [ "singleplayer", "multiplayer" ];
        this.gameType = "singleplayer";
        this.seed = '1';
        this.planetCount = '12';
        this.difficulties = [ 'easy', 'medium', 'difficult', 'insanity' ];
        this.difficulty = 'easy';
        this.characters = [ 'robot','alien'];
        this.character = 'alien';
        this.color = 'rgb(255,0,255)';
        this.server = 'http://localhost';
        this.savedGameFile = '';
        this.options = {
            sound: false,
            controls: {
                forward: "w",
                backwards: "s",
                strafeleft: "q",
                straferight: "e",
                turnleft: "a",
                turnright: "d",
                jump: " ",
                dash: "f",
                dive: "z",
                action1: "1",
                action2: "2",
                action3: "3",
                action4: "4",
                action5: "5",
                action6: "6",
                action7: "7",
                action8: "8",
                action9: "9",
                action10: "10"
            },
            graphics: {
                viewdistance: 500,
                texturequality: ['fair','good','best']
            }
        }
    
    }
}