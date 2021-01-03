export default class Character{
    constructor(){
        this.key_up;
        this.key_down;
        this.key_left;
        this.key_right;
        this.sprite;
        this.food;
        this.damage;
        this.lastGridX;
        this.lastGridY;
        this.foodTime;
        this.foodCountDown = 0;
        this.moveSpeed;


    }

    createCharacter(scene) {
        var sprite = scene.add.sprite(100, 100, 'steven')
        sprite.lastGridX = Math.round((sprite.x - 20) / 40);
        sprite.lastGridY = Math.round((sprite.y) / 40);
        sprite.scale = 1;
        sprite.depth = 10;
        console.log(scene.anims.generateFrameNumbers('steven'))
        scene.anims.create({
            key: 'idle',
            frames: [
                { key: "steven", frame: 0 },
                { key: "steven", frame: 1 }
            ],
            frameRate: 10
        });

        scene.anims.create({
            key: 'running',
            frames: scene.anims.generateFrameNumbers('steven', {
                start: 11,
                end: 16
            }),
            frameRate: 10
        });


        sprite.play({ key: 'idle', repeat: -1 });


        sprite.idle = true;

        this.sprite = sprite;


        scene.input.keyboard.on('keyup', function (event) {
            sprite.play({ key: 'idle', repeat: -1 });
            sprite.idle = true;
        })

        this.food = scene.initFood;
        this.damage = scene.initDamage;
        scene.text.setText('food: ' + this.food);
        scene.damageText.setText('damage ' + this.damage);


        this.key_up = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.key_down = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.key_left = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.key_right = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    }

    characterMove() {
        if (this.key_up.isDown) {
            if (this.sprite.idle) {
                this.sprite.idle = false;
                this.sprite.play({ key: 'running', repeat: -1 });
            }
            this.sprite.y -= this.moveSpeed
        }

        if (this.key_down.isDown) {
            if (this.sprite.idle) {
                this.sprite.idle = false;
                this.sprite.play({ key: 'running', repeat: -1 });
            }
            this.sprite.y += this.moveSpeed

        }

        if (this.key_left.isDown) {
            if (this.sprite.idle) {
                this.sprite.idle = false;
                this.sprite.play({ key: 'running', repeat: -1 });
            }
            this.sprite.x -= this.moveSpeed
        }

        if (this.key_right.isDown) {
            if (this.sprite.idle) {
                this.sprite.idle = false;
                this.sprite.play({ key: 'running', repeat: -1 });
            }
            this.sprite.x += this.moveSpeed
        }
    }

    eatFood(scene) {
        if (this.foodCountDown == 0) {
            this.food -= 1;
            scene.text.setText('food: ' + this.food + '   eat food!');
            if (this.food < 0) {
                //GameOver
                scene.scene.pause();
                scene.scene.run('sceneB');

            }
            this.foodCountDown = this.foodTime;
        } else {
            this.foodCountDown--;
        }
    }
    
    
    

}