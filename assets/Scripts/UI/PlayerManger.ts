import { _decorator, Component, EventTouch, input, Input, Label, Node, UITransform, Vec2, Vec3 } from 'cc';
import { IPlayer } from '../Common';
const { ccclass, property } = _decorator;
@ccclass('PlayerManger')
export class PlayerManger extends Component {

    init(player:IPlayer){
        this.node.active =true;
        const  lb =this.node.getComponent(Label);
        lb.string = player.nickName;

        
    }

     
}