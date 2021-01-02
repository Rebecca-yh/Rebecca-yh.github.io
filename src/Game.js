import SceneA from './SceneA.js'
import SceneB from './SceneB.js'

var config = {
    type: Phaser.CANVAS,
    parent: 'phaser-example',
    width: 960,
    height: 960,
    backgroundColor:"#888888",
    scene: [SceneA, SceneB]
};

var game = new Phaser.Game(config);