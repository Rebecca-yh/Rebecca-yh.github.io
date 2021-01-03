import character from './Character.js'

export default class SceneA extends Phaser.Scene {

    constructor() {
        super('sceneA');

        this.init = false;
        this.gameOverText;
        this.text;
        this.damageText;
        this.monsterText;
       
        this.character

        this.key_create;
        this.key_refresh;
        this.key_update;
        this.key_portal;

        this.mapSize = 24;
        this.map;


        this.foodToShelter = 10;
        this.shelterMap;
        this.shelters = [];
        this.foodToDamage = 5;
        this.foodSum = 0;
        this.monsterSum = 0;
        this.portalCoolDown;
        this.countDown = 0;
        this.monsterDamage = 5;
        this.initDamage;
        this.initFood;
        this.minFood;
        this.minMonster;
        this.currentShelter = 0;
        this.foodFromMonster;

    }

    preload() {
        this.load.spritesheet('steven', 'src/assets/Steven/Aseprite/normal.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('food1', 'src/assets/food1.png');
        this.load.image('food2', 'src/assets/food2.png');
        this.load.image('shelter', 'src/assets/shelter.png');

        this.load.spritesheet('monster', 'src/assets/DinoSprites.png', { frameWidth: 24, frameHeight: 24 });


    }



    create() {
        this.character = new character();
        this.getData();


    }

    initScene() {
        this.add.grid(0, 0, 40 * this.mapSize, 40 * this.mapSize, 40, 40).setOrigin(0, 0).setOutlineStyle(0xffffff);

        this.text = this.add.text(304, 280).setScrollFactor(0);;
        this.damageText = this.add.text(304, 300).setScrollFactor(0);;
        this.monsterText = this.add.text(304, 250).setScrollFactor(0);;

        this.character.createCharacter(this);
        this.createFood();
        this.createMonster();

        // 按键
        this.key_create = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.key_refresh = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.key_update = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);
        this.key_portal = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        console.log(this.character.sprite.x)
        this.cameras.main.startFollow(this.character.sprite, true, 0.09, 0.09);
        // this.cameras.main.roundPixels = true;

        this.cameras.main.setZoom(2);

        this.init = true;
    }


    // 从json中读数据
    getData() {
        var url = "src/data/data.json"/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
        var request = new XMLHttpRequest();
        request.open("get", url);/*设置请求方法与路径*/
        request.send(null);/*不发送数据到服务器*/
        var that = this;
        request.onload = function () {/*XHR对象获取到返回信息后执行*/
            if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
                var json = JSON.parse(request.responseText);
                that.mapSize = json.mapSize;
                that.initDamage = json.initDamage;
                that.initFood = json.initFood;
                that.minFood = json.minFood;
                that.minMonster = json.minMonster;
                that.foodToShelter = json.foodToShelter;
                that.foodToDamage = json.foodToDamage;
                that.monsterDamage = json.monsterDamage;
                that.portalCooldown = json.portalCooldown;
                that.foodFromMonster = json.foodFromMonster;

                //character
                that.character.moveSpeed = json.character.moveSpeed;
                that.character.foodTime = json.character.foodTime;
                that.initScene(that);

            }
        }
    }



    update() {
        if (!this.init) return;
        this.character.characterMove();
        var gridX = Math.round((this.character.sprite.x - 20) / 40);
        var gridY = Math.round((this.character.sprite.y) / 40);
        if (gridY < 0) gridY = 0;
        if (gridY > this.mapSize - 1) gridY = this.mapSize - 1;
        if (gridX < 0) gridX = 0;
        if (gridX > this.mapSize - 1) gridX = this.mapSize - 1;
        if (this.character.lastGridX != gridX || this.character.lastGridY != gridY) {
            console.log(gridX, gridY)
            this.trigger(gridX, gridY);
        }

        this.keyDownEvent(gridX, gridY);
        this.character.lastGridX = gridX;
        this.character.lastGridY = gridY;

        //消耗
        this.character.eatFood(this);

    }


    keyDownEvent(x, y) {

        this.createShelter(x, y);
        this.refresh()
        this.updateDamage()
        this.portal();
    }

    trigger(x, y) {
        if (this.map[x][y] == null) return;

        this.collectFood(x, y)
        this.combat(x, y);
    }

  

    updateDamage() {
        if (this.key_update.isDown) {
            if (this.character.food > this.foodToDamage && this.shelters.length > 0) {
                this.character.food -= this.foodToDamage
                this.character.damage += 1 * this.shelters.length;
                this.text.setText('food: ' + this.character.food);
                this.damageText.setText('damage ' + this.character.damage);
                console.log("update");
            }
        }
    }

    refresh() {
        if (this.key_refresh.isDown) {
            for (var i = 0; i != this.mapSize; i++) {
                for (var j = 0; j != this.mapSize; j++) {
                    var obj = this.map[i][j];
                    if (obj != null && obj.type == 0) {
                        obj.destroy()
                        this.map[i][j] = null
                    }
                }
            }
            this.createFood();
            // this.createMonster();
            console.log("refresh");
        }
    }

     // Food

     createFood() {
        if (this.map == null) {
            this.map = [];
            for (var i = 0; i != this.mapSize; i++) {
                this.map.push([])
                for (var j = 0; j != this.mapSize; j++) {
                    this.map[i].push(null)
                }
            }
        }
        for (var i = 0; i != this.mapSize; i++) {
            var sequence = "";
            for (var p = 0; sequence.length < this.mapSize; p++) {
                sequence += Math.random().toString(36).substr(2);
            }
            for (var j = 0; j != this.mapSize; j++) {
                if (this.map[i][j] != null) continue;
                switch (sequence[j]) {
                    case 'a':
                        var food = this.add.sprite(i * 40 + 20, j * 40 + 20, 'food1');
                        food.type = 0;
                        this.map[i][j] = food;
                        this.foodSum += 1;
                        break;
                    case 'b':
                        var food = this.add.sprite(i * 40 + 20, j * 40 + 20, 'food2');
                        food.type = 0;
                        this.map[i][j] = food;
                        this.foodSum += 1;
                        break;
                    default:
                        this.map[i].push(null)
                }

            }

        }
        console.log(this.map);
        this.shelter();


    }

    collectFood(x, y) {

        var food = this.map[x][y]
        if (food != null) {
            if (food.type != 0) return;
            food.destroy()
            this.map[x][y] = null
            this.character.food += 1;
            this.text.setText('food: ' + this.character.food);
            this.foodSum--;
            if (this.foodSum < this.minFood) {
                this.createFood();
            }

            return true;
        }
        return false;
    }


    // Shelter
    createShelter(x, y) {
        if (this.key_create.isDown) {
            if (this.character.food < this.foodToShelter) return;

            if (this.shelterMap == null) {
                this.shelterMap = [];
                for (var i = 0; i != this.mapSize; i++) {
                    this.shelterMap.push([])
                    for (var j = 0; j != this.mapSize; j++) {
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
            this.character.food -= this.foodToShelter
            shelter.collected = 0;
            shelter.text = this.add.text(x * 40, y * 40 + 20, 'collected: ' + shelter.collected);
            this.shelters.push(shelter)
            console.log("create");
            this.text.setText('food: ' + this.character.food);
            this.shelter();

        }
    }

    shelter() {
        if (this.shelters.length == 0) return;
        for (var i = 0; i != this.mapSize; i++) {
            for (var j = 0; j != this.mapSize; j++) {
                if (this.shelterMap[i][j] != null) {
                    var shelter = this.shelters[this.shelterMap[i][j]];
                    if (this.collectFood(i, j)) {
                        shelter.collected += 1;
                        shelter.text.setText('collected: ' + shelter.collected);
                    }
                }
            }
        }
    }

    portal() {
        if (this.countDown > 0) {
            this.countDown--;
            return;
        }
        if (this.key_portal.isDown) {
            if (this.shelters.length == 0) return;
            this.character.x = this.shelters[this.currentShelter].x;
            this.character.y = this.shelters[this.currentShelter].y;
            this.currentShelter++;
            if (this.currentShelter >= this.shelters.length)
                this.currentShelter = 0;
            this.countDown = this.portalCooldown
        }

    }




    // Monster

    createMonster() {

        if (this.map == null) {
            this.map = [];
            for (var i = 0; i != this.mapSize; i++) {
                this.map.push([])
                for (var j = 0; j != this.mapSize; j++) {
                    this.map[i].push(null)
                }
            }
        }
        for (var i = 0; i != this.mapSize; i++) {
            // 生成随机序列
            var sequence = "";
            for (var p = 0; sequence.length < this.mapSize; p++) {
                sequence += Math.random().toString(36).substr(2);
            }

            console.log(sequence);
            for (var j = 0; j != this.mapSize; j++) {
                if (this.map[i][j] != null) continue;
                if (this.shelterMap != null && this.shelterMap[i][j] != null) continue;
                switch (sequence[j]) {
                    case 'a':
                        var monster = this.add.sprite(i * 40 + 20, j * 40 + 20, 'monster');
                        monster.type = 1;
                        this.monsterSum += 1;
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
        this.monsterText.setText('剩余怪物数量: ' + this.monsterSum);

    }

    combat(x, y) {
        var monster = this.map[x][y]
        if (monster != null) {
            if (monster.type != 1) return;
            if (this.character.damage < this.monsterDamage) {
                //TODO:GameOver
                this.scene.pause();
                this.scene.run('sceneB');

                return;
            }
            monster.destroy()
            this.map[x][y] = null
            this.character.damage -= this.monsterDamage;
            this.monsterSum -= 1;

            this.character.food += this.foodFromMonster;
            this.text.setText('food: ' + this.character.food);
            this.damageText.setText('damage ' + this.character.damage);
            this.monsterText.setText('剩余怪物数量: ' + this.monsterSum);
            if (this.monsterSum == 0) {
                this.game.win = true;
                this.scene.pause();
                this.scene.run('sceneB');
            }
            return true;
        }
        return false;

    }


}
