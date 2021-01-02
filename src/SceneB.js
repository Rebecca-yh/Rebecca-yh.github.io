export default class SceneB extends Phaser.Scene {
    p

    constructor() {
        super('sceneB');
    this.text;
    }
    
    create() {
        var graphics = this.add.graphics();

        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(0, 0, 960, 960);

        this.text = this.add.text(400, 400, 'GameOver');

    
    }
    
    update() {
    
    
    
    }
    
    }