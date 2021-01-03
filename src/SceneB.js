export default class SceneB extends Phaser.Scene {
    

    constructor() {
        super('sceneB');
    this.text;
    }
    
    create() {
        var graphics = this.add.graphics();

        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(0, 0, 960, 960);

        console.log("this.game.win");
        if(this.game.win)
        this.text = this.add.text(400, 400, 'You Win!');
        else
        this.text = this.add.text(400, 400, 'Game Over');
   

    
    }
    
    update() {
    
    
    }
    
    }