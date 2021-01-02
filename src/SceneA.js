

export default class SceneA extends Phaser.Scene {

    constructor() {
        super('sceneA');

        this.gameOverText;
        this.text;
        this.damageText;
        this.steven;
        this.key_up;
        this.key_down;
        this.key_left;
        this.key_right;
        this.key_create;
        this.key_refresh;
        this.key_update;

        this.moveSpeed = 2;
        this.map;
        this.objSum = 0;

        this.shelterNeedFood = 10;
        this.shelterMap;
        this.shelters = [];
        this.foodToDamage = 5;
        
        this.monsterDamage = 5;


    }

    preload() {
        this.load.spritesheet('steven', 'src/assets/Steven/Aseprite/normal.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('food1', 'src/assets/food1.png');
        this.load.image('food2', 'src/assets/food2.png');
        this.load.image('shelter', 'src/assets/shelter.png');

        this.load.spritesheet('monster', 'src/assets/DinoSprites.png',{ frameWidth: 24, frameHeight: 24 });

    }



    create() {

        this.add.grid(0, 0, 960, 960, 40, 40).setOrigin(0, 0).setOutlineStyle(0xffffff);
        // this.text = this.add.text(100, 50, '');

        this.createCharacter();
        this.createFood();
        this.createMonster();
        this.text = this.add.text(100, 50, '');
        this.damageText = this.add.text(100, 100, '');

        this.key_up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.key_down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.key_left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.key_right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.key_create = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.key_refresh = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.key_update = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);

    }




    createCharacter() {
        var steven = this.add.sprite(100, 100, 'steven')
        steven.lastGridX = Math.round((steven.x - 20) / 40);
        steven.lastGridY = Math.round((steven.y) / 40);
        steven.scale = 1;
        steven.depth = 10;
        console.log(this.anims.generateFrameNumbers('steven'))
        this.anims.create({
            key: 'idle',
            frames: [
                { key: "steven", frame: 0 },
                { key: "steven", frame: 1 }
            ],
            frameRate: 10
        });

        this.anims.create({
            key: 'running',
            frames: this.anims.generateFrameNumbers('steven', {
                start: 11,
                end: 16
              }),
            frameRate: 10
        });
            

        steven.play({ key: 'idle', repeat: -1 });


        steven.idle = true;

        this.steven = steven;


        var steven = this.steven
        this.input.keyboard.on('keyup', function (event) {
            steven.play({ key: 'idle', repeat: -1 });
            steven.idle = true;
        })

        this.steven.food = 0;
        this.steven.damage = 5;
    }


    createFood() {
        if (this.map == null) {
            this.map = [];
            for (var i = 0; i != 24; i++) {
                this.map.push([])
                for (var j = 0; j != 24; j++) {
                    this.map[i].push(null)
                }
            }
        }
        for (var i = 0; i != 24; i++) {
            var sequence = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
            console.log(sequence);
            for (var j = 0; j != 24; j++) {
                if (this.map[i][j] != null) continue;
                switch (sequence[j]) {
                    case 'a':
                        var food = this.add.sprite(i * 40 + 20, j * 40 + 20, 'food1');
                        food.type = 0;
                        this.map[i][j] = food;
                        this.objSum += 1;
                        break;
                    case 'b':
                        var food = this.add.sprite(i * 40 + 20, j * 40 + 20, 'food2');
                        food.type = 0;
                        this.map[i][j] = food;
                        this.objSum += 1;
                        break;
                    default:
                        this.map[i].push(null)
                }

            }

        }
        console.log(this.map);
        this.shelter();


    }



    update() {
        this.charaterMove();
        var gridX = Math.round((this.steven.x - 20) / 40);
        var gridY = Math.round((this.steven.y) / 40);
        if (gridY < 0) gridY = 0;
        if (gridY > 23) gridY = 23;
        if (gridX < 0) gridX = 0;
        if (gridX > 23) gridX = 23;
        if (this.steven.lastGridX != gridX || this.steven.lastGridY != gridY) {
            console.log(gridX, gridY)
            this.trigger(gridX,gridY);
        }

        this.keyDownEvent(gridX, gridY);
        // this.shelter();
        this.steven.lastGridX = gridX;
        this.steven.lastGridY = gridY;

    }


    charaterMove() {
        if (this.key_up.isDown) {
            if (this.steven.idle) {
                this.steven.idle = false;
                this.steven.play({ key: 'running', repeat: -1 });
            }
            this.steven.y -= this.moveSpeed
        }

        if (this.key_down.isDown) {
            if (this.steven.idle) {
                this.steven.idle = false;
                this.steven.play({ key: 'running', repeat: -1 });
            }
            this.steven.y += this.moveSpeed

        }

        if (this.key_left.isDown) {
            if (this.steven.idle) {
                this.steven.idle = false;
                this.steven.play({ key: 'running', repeat: -1 });
            }
            this.steven.x -= this.moveSpeed
        }

        if (this.key_right.isDown) {
            if (this.steven.idle) {
                this.steven.idle = false;
                this.steven.play({ key: 'running', repeat: -1 });
            }
            this.steven.x += this.moveSpeed
        }
    }

    keyDownEvent(x, y) {

        this.createShelter(x, y);
        this.refresh()
        this.updateDamage()
    }

trigger(x,y){
    this.collectFood(x,y)
    this.combat(x,y);
}

    collectFood(x, y) {

        var food = this.map[x][y]
        if (food != null) {
            if(food.type != 0) return;
            food.destroy()
            this.map[x][y] = null
            this.steven.food += 1;
            this.text.setText('food: ' + this.steven.food);
            this.objSum--;
            if (this.objSum < 20) {
                this.createFood();
            }
           
            return true;
        }
        return false;
    }

    updateDamage(){
        if (this.key_update.isDown) {
        if(this.steven.food>this.foodToDamage && this.shelters.length>0){
            this.steven.food-=this.foodToDamage
            this.steven.damage+=1*this.shelters.length;
            this.text.setText('food: ' + this.steven.food);
            this.damageText.setText('damage ' + this.steven.damage);
            console.log("update");
        }
    }
    }
    refresh() {
        if (this.key_refresh.isDown) {
            this.createFood();
            this.createMonster();
            console.log("refresh");
        }
    }

    createShelter(x, y) {
        if (this.key_create.isDown) {
            if (this.steven.food < this.shelterNeedFood) return;

            if (this.shelterMap == null) {
                this.shelterMap = [];
                for (var i = 0; i != 24; i++) {
                    this.shelterMap.push([])
                    for (var j = 0; j != 24; j++) {
                        this.shelterMap[i].push(null)
                    }
                }
            }
            for (var i = x - 1; i <= x + 1; i++) {
                for (var j = y - 1; j <= y + 1; j++) {
                    if (this.shelterMap[i][j] != null)
                        return;
                }
            }
            for (var i = x - 1; i <= x + 1; i++) {
                for (var j = y - 1; j <= y + 1; j++) {
                    this.shelterMap[i][j] = this.shelters.length;
                }
            }

            var shelter = this.add.sprite(x * 40 + 20, y * 40 + 20, 'shelter');
            shelter.depth = 0;
            shelter.scale = 0.5;
            this.steven.food -= this.shelterNeedFood
            shelter.collected = 0;
            shelter.text = this.add.text(x * 40, y * 40 + 20, 'collected: ' + shelter.collected);
            this.shelters.push(shelter)
            console.log("create");
            this.text.setText('food: ' + this.steven.food);
            this.shelter();
            
        }
    }

    shelter() {
        if(this.shelters.length==0) return;
        for (var i = 0; i != 24; i++) {
            for (var j = 0; j != 24; j++) {
                if (this.shelterMap[i][j] != null) {
                    var shelter = this.shelters[this.shelterMap[i][j]];
                    if(this.collectFood(i, j))
                    {
                        shelter.collected += 1;
                        shelter.text.setText('collected: ' + shelter.collected);
                    }
                }
            }
        }
    }






    // Monster

    createMonster(){
        
            if (this.map == null) {
                this.map = [];
                for (var i = 0; i != 24; i++) {
                    this.map.push([])
                    for (var j = 0; j != 24; j++) {
                        this.map[i].push(null)
                    }
                }
            }
            for (var i = 0; i != 24; i++) {
                var sequence = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
                console.log(sequence);
                for (var j = 0; j != 24; j++) {
                    if (this.map[i][j] != null) continue;
                    switch (sequence[j]) {
                        case 'a':
                            var monster = this.add.sprite(i * 40 + 20, j * 40 + 20, 'monster');
                            monster.type = 1;
                            this.objSum+=1;
                            this.anims.create({
                                key: 'monster-idle',
                                frames: this.anims.generateFrameNumbers('monster', {
                                    start: 0,
                                    end: 3
                                  }),
                                frameRate: 10
                            });
                            monster.play({ key: 'monster-idle', repeat: -1 });
                            this.map[i][j] = monster;
                            break;
                      
                        default:
                            this.map[i].push(null)
                    }
    
                }
    
            }
            console.log(this.map);
    
    }

    combat(x,y){ 
        var monster = this.map[x][y]
        if (monster != null) {
            if(monster.type != 1) return;
            if(this.steven.damage< this.monsterDamage) {
                //TODO:GameOver
                this.scene.pause();
                this.scene.run('sceneB');

                return;
            }
            monster.destroy()
            this.map[x][y] = null
            this.steven.damage -= this.monsterDamage;
            this.objSum-=1;
            this.damageText.setText('damage: ' + this.steven.damage);
            this.steven.food+=10
            
            return true;
        }
        return false;

    }

}
