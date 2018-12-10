// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

// var Platform = cc.Class({
//     name:"Platform",
//     properties:{
//         id:0,
//         itemName:"",
//         itemPrice:0,
//         iconSF:cc.SpriteFrame,        
//     }
// });



cc.Class({
    extends: cc.Component,

    properties: {
        pHead:{
            default:null,
            type:cc.Node
        },
        pBody:{
            default:null,
            type:cc.Node
        },
        player:{
            default:null,
            type:cc.Node
        },
        score:{
            default:null,
            type:cc.Label
        },
        _timer:0, //蓄力计时器
        _isTouching:false, //是否按下
        
        target:{ //下一个平台的目标位置
            visible:false,
            default:null,
            type:cc.v2,
        }, 
        base:{ //当前位置
            visible:false,
            default:null,
            type:cc.v2,
        },
        platformList:{
            default:[],
            type:cc.Prefab,
        },
        platformGroup:{ //平台的组     
            default:null,
            type:cc.Node,
        },
        _isLeft:true,        

        //当前平台
        pBase:{
            visible:false,
            default:null,
            type:cc.Node,
        },

        //目标平台
        pTarget:{
            visible:false,
            default:null,
            type:cc.Node,
        },

        message:cc.Node,

        root:cc.Node, //同步更新玩家和平台的位置
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = false;
        this.mark = 0;
        this.score.string = "Score:"+this.mark;
        this.node.on('touchstart', this.touchStart, this); //注册触摸的监听器
        this.node.on('touchend', this.touchEnd, this); //注册结束触摸的监听器
        this.act1 = cc.scaleTo(3, 1, 0.5); //开始蓄力下蹲的动作
        this.act2 = cc.scaleTo(0.1, 1, 1); //快速恢复原状的动作
        this.act3 = cc.moveBy(3, 0, -48); //头部跟随向下的动作
        this.act4 = cc.moveTo(0.1, this.pBody.x, this.pBody.y+96+32); //头部快速复位的动作
        //角色的初始位置
        this.player.position = cc.v2(220,260);
        this.base = this.player.position;

        
        //生成最初的两块平台
        var x1 = this.choosePlatformType();  //第一块
        var firstPlatform = cc.instantiate(this.platformList[x1]);        
        this.platformGroup.addChild(firstPlatform);
        firstPlatform.setPosition(this.base);
        this.pBase = firstPlatform;    
        // console.log(this.pBase.getComponent('Platform').result);

        var x2 = this.choosePlatformType();  //第二块
        var secondPlatform = cc.instantiate(this.platformList[x2]);        
        this.platformGroup.addChild(secondPlatform);
        secondPlatform.setPosition(cc.v2(530,350));
        this.target = secondPlatform.position;
        this.pTarget = secondPlatform;  
        
        
        //获取角色状态        
        this.playerJ = this.player.getComponent('Player');
       
        
    },

    //开始按住屏幕
    touchStart:function() {
        if(this.playerJ.status == 0) {
            this._isTouching = true;
            this._timer = 0;
            this.pBody.runAction(this.act1);
            this.pHead.runAction(this.act3);
        }        
        var platformK = this.pTarget.getComponent("Platform");

        console.log(this.player.position);
        
    },
    
    //松手
    touchEnd:function() {
        if(this.playerJ.status == 0) {
            this._isTouching = false;
            this.pBody.stopAction(this.act1);        
            this.pBody.runAction(this.act2);
            this.pHead.stopAction(this.act3);        
            this.pHead.runAction(this.act4);
            this.jumpToTarget();
        }
    },

    jumpToTarget:function() {
        this.playerJ.status = 1;
        var base = this.player.position;
        var target = this.pTarget.position;
        var direction = target.sub(base).normalize(); //确定方向向量
        var jumpTarget = base.add(direction.mul(300 * this._timer)); //通过蓄力时间计算能够跳到的位置，方向是目标方向
        var jumpAction = cc.moveTo(0.5,jumpTarget);  //向目标方向跳跃
        var finished = cc.callFunc(this.jumpFinished, this); //动作回调，完成跳跃后
        var seq = cc.sequence(jumpAction,finished);
        this.player.runAction(seq);             
    },

    //完成跳跃后的回调
    jumpFinished:function() {
        this.playerJ.status = 2;
        var platformK = this.pTarget.getComponent("Platform");

        console.log(platformK.result);
        if(platformK.result == 1) { //是否成功着陆
            //跳跃成功加分
            this.mark += 1;
            this.score.string = "Score:"+this.mark;
            
                            
            

            //更新全部位置
            this.refreshPosition();
            
        }
        if(platformK.result == 2) {
            this.message.active = true;
        }
    },

    //更新镜头
    refreshPosition:function() {
        this.pBase.destroy(); //摧毁已离开的平台
        this.base = this.target;        
        this.pBase = this.pTarget;           
        this.spawnNewPlatform(); //生成新的平台
        
        
        //更新主角与当前平台的位置
        if(this._isLeft){
            var actZero = cc.moveTo(1,530,260)
            var refresh = cc.v2(530,260).sub(this.player.position)
        } else {
            var actZero = cc.moveTo(1,220,260)
            var refresh = cc.v2(220,260).sub(this.player.position)
        }

        var bP = this.pBase.position.add(refresh);
        var tP = this.pTarget.position.add(refresh);

        var actB = cc.moveTo(1,bP);
        var actP = cc.moveTo(1,tP);       
        
        

        var finished2 = cc.callFunc(this.refreshAllFinished, this); //动作回调，完成跳跃后
        var seq2 = cc.sequence(actZero,finished2);              
        this.player.runAction(seq2);

        this.pBase.runAction(actB);
        this.pTarget.runAction(actP);

        this.base = this.player.position;
        this.target = this.pTarget.position;
        console.log(this.player.position);
        

    },
    refreshAllFinished:function() {
        // player的状态 0 更新
        this.playerJ.status = 0;
    },

    //生成一个新的平台
    spawnNewPlatform:function() {
        var x = this.choosePlatformType();  
        var newPlatform = cc.instantiate(this.platformList[x]);        
        this.platformGroup.addChild(newPlatform);
        newPlatform.setPosition(this.getNewPosition());
        this.target = newPlatform.position;
        this.pTarget = newPlatform;
        
    },

    //进行1/2的概率判断
    getRandom:function() {
        var x = Math.random();
        if(x > 0.5) {
            this._isLeft = true;
        } else {
            this._isLeft = false;
        }
    },

    choosePlatformType:function() {
        var x = Math.random() * 6;
        if(x < 1) {
            return 0;
        }
        if(x >= 1 && x < 2) {
            return 1;
        }
        if(x >= 2 && x < 3) {
            return 2;
        }
        if(x >= 3 && x < 4) {
            return 3;
        }
        if(x >= 4 && x < 5) {
            return 4;
        }
        if(x >= 5 && x < 6) {
            return 5;
        }
        
    },

    //为新平台挑选一个生成位置
    getNewPosition: function () {
        //随机向左或是向右确定x
        this.getRandom();
        var i = -1;
        if(this._isLeft) {
            i = -1;
        } else {
            i = 1;
        }
        var randX = this.player.x + this.node.width/2 * i;        
        var randY = this.player.y + 400 * Math.random() + 50;
        return cc.v2(randX, randY);
    },

    start () {

    },

    restartGame:function() {
        cc.director.loadScene("Game");
    },

    update (dt) {
        //蓄力计时器
        if(this._isTouching) {
            this._timer+=dt;
            if(this._timer >= 3) {
                this._timer=3
            }
            
        }
    },
});



