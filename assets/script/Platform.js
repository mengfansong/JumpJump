// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var judge = cc.Enum({
    enter:0,
    stay:1,
    exit:2
});

cc.Class({
    extends: cc.Component,

    properties: {
               
        result:{
            visible:true,
            default:judge.exit,
            type:cc.Enum(judge),
        }
    },

    onLoad () {
        //获取角色状态        
        // var playerJ = this.player.getComponent('Player');
        
        console.log("生成了平台")
        
    }, 


    onCollisionEnter: function (other, self) {
        // this.result = 0;
        // console.log("123");
    },
    onCollisionStay: function (other, self) {
        // var playerJ = this.player.getComponent('Player');
        // if(playerJ.status == 2 && this.isTarget) {
        //     this.result = 1;
        // }
        this.result = 1;
        // console.log("stay");
        // console.log("stay");
    },
    onCollisionExit: function (other, self) {
        // if(this.isTarget)
        // this.result = 0;
        this.result = 2;
        // console.log("exit");
    },

    // LIFE-CYCLE CALLBACKS:

    

    start () {

    },

    update (dt) {
        // var playerJ = this.player.getComponent('Player');
        // if(playerJ.status == 2 && this.result != 1) {
        //     this.result = 2;
        // }
    },
});
