import { _decorator, Component, EventTouch, input, Input, Node, UITransform, Vec2, Vec3 } from 'cc';
import { EntityTypeEnum, IAcotor, InputTypeEnum, IVec2_1 } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { EntityStateEnum, EventEnum } from '../../Enum';
import { ExplosionStateMachine } from './ExplosionStateMachine';
const { ccclass, property } = _decorator;

@ccclass('ExplosionManager')
export class ExplosionManager extends EntityManager {


    init(type: EntityTypeEnum, { x, y }: IVec2_1) {

        this.node.position = new Vec3(x, y, 0);
        this.fsm = this.node.addComponent(ExplosionStateMachine);
        this.fsm.init(type);
        this.state = EntityStateEnum.Idle;

    }
}