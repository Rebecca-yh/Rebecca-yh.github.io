

export default class SceneA extends Phaser.Scene {

    constructor() {
        super('sceneA');

        this.init = false;
        this.gameOverText;
        this.text;
        this.damageText;
        this.monsterText;
        this.steven;
        this.key_up;
        this.key_down;
        this.key_left;
        this.key_right;
        this.key_create;
        this.key_refresh;
        this.key_update;
        this.key_portal;

        this.mapSize = 24;
        this.moveSpeed = 2;
        this.map;


        this.foodToShelter = 10;
        this.shelterMap;
        this.shelters = [];
        this.foodToDamage = 5;
        this.foodSum = 0;
        this.monsterSum = 0;
        this.portalCoolDown;
        this.countDown = 0;;

        
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

        this.load.spritesheet('monster', 'src/assets/DinoSprites.png',{ frameWidth: 24, frameHeight: 24 });

       
    }



    create() {
        this.getData();
       
   
    }

    initScene(){
        this.add.grid(0, 0, 40*this.mapSize, 40*this.mapSize, 40, 40).setOrigin(0, 0).setOutlineStyle(0xffffff);
       
        this.text = this.add.text(304, 280).setScrollFactor(0);;
        this.damageText = this.add.text(304, 300).setScrollFactor(0);;
        this.monsterText = this.add.text(304, 250).setScrollFactor(0);;

        this.createCharacter();
        this.createFood();
        this.createMonster();
   

        this.key_up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.key_down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.key_left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.key_right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.key_create = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.key_refresh = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.key_update = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);
        this.key_portal =  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        this.cameras.main.startFollow(this.steven, true, 0.09, 0.09);
        // this.cameras.main.roundPixels = true;
    
        this.cameras.main.setZoom(2);

        this.init = true;
    }
  


getData(){
    var url = "src/data/data.json"/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
    var request = new XMLHttpRequest();
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    var that = this;
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
        if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
            var json = JSON.parse(request.responseText);
            that.mapSize = json["mapSize"];
            that.initDamage = json["initDamage"];
            that.initFood = json["initFood"];
            that.moveSpeed = json["moveSpeed"];
            that.minFood = json["minFood"];
            that.minMonster = json["minMonster"];
            that.foodToShelter = json["foodToShelter"];
            that.foodToDamage = json["foodToDamage"];
            that.monsterDamage = json["monsterDamage"];
            that.portalCooldown = json["portalCooldown"];
            that.foodFromMonster = json["foodFromMonster"];
            that.initScene();
        
        }
    }
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


        this.input.keyboard.on('keyup', function (event) {
            steven.play({ key: 'idle', repeat: -1 });
            steven.idle = true;
        })

        this.steven.food = this.initFood;
        this.steven.damage = this.initDamage;
        this.text.setText('food: ' + this.steven.food);
        this.damageText.setText('damage ' + this.steven.damage);

    }


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
            var sequence ="";
            for(var p = 0;sequence.length<this.mapSize;p++){
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



    update() {
        if(!this.init) return;
        this.charaterMove();
        var gridX = Math.round((this.steven.x - 20) / 40);
        var gridY = Math.round((this.steven.y) / 40);
        if (gridY < 0) gridY = 0;
        if (gridY > this.mapSize-1) gridY = this.mapSize-1;
        if (gridX < 0) gridX = 0;
        if (gridX > this.mapSize-1) gridX = this.mapSize-1;
        if (this.steven.lastGridX != gridX || this.steven.lastGridY != gridY) {
            // console.log(gridX, gridY)
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
        this.portal();
    }

trigger(x,y){
    if(this.map[x][y]==null) return;

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
            this.foodSum--;
            if (this.foodSum < this.minFood) {
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
            for(var i =0;i!=this.mapSize;i++){
                for(var j =0;j!=this.mapSize;j++){
                  var obj = this.map[i][j];
                    if(obj!=null && obj.type == 0){
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


    // Shelter
    createShelter(x, y) {
        if (this.key_create.isDown) {
            if (this.steven.food < this.foodToShelter) return;

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
            this.steven.food -= this.foodToShelter
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
        for (var i = 0; i != this.mapSize; i++) {
            for (var j = 0; j != this.mapSize; j++) {
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

    portal(){
        if(this.countDown>0) {
            this.countDown--;
            return;
        }
        if (this.key_portal.isDown) {
            if(this.shelters.length==0) return;
            this.steven.x = this.shelters[this.currentShelter].x;
            this.steven.y = this.shelters[this.currentShelter].y;
            this.currentShelter++;
            if(this.currentShelter>=this.shelters.length)
                this.currentShelter = 0;
            this.countDown = this.portalCooldown
        }
        
    }




    // Monster

    createMonster(){
        
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
                var sequence ="";
                for(var p = 0;sequence.length<this.mapSize;p++){
                    sequence += Math.random().toString(36).substr(2);
                }
               
                console.log(sequence);
                for (var j = 0; j != this.mapSize; j++) {
                    if (this.map[i][j] != null) continue;
                    if(this.shelterMap!=null &&this.shelterMap[i][j]!=null) continue;
                    switch (sequence[j]) {
                        case 'a':
                            var monster = this.add.sprite(i * 40 + 20, j * 40 + 20, 'monster');
                            monster.type = 1;
                            this.monsterSum+=1;
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
            this.monsterSum-=1;
            
            this.steven.food+=this.foodFromMonster;
            this.text.setText('food: ' + this.steven.food);
            this.damageText.setText('damage ' + this.steven.damage);
            this.monsterText.setText('剩余怪物数量: ' + this.monsterSum);
            if(this.monsterSum == 0){
                this.game.win = true;
                this.scene.pause();
                this.scene.run('sceneB');
            }
            return true;
        }
        return false;

    }


}
