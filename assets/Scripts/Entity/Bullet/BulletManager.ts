import { Tween, Vec3, _decorator, instantiate, tween, } from 'cc';
import { EntityTypeEnum, IAcotor, IBullet, IVec2_1, InputTypeEnum } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { EntityStateEnum, EventEnum } from '../../Enum';
import { BulletStateMachine } from './BulletStateMachine';
import { rad2Angle } from '../../../Utils';
import EventManager from '../../Global/EventManager';
import DataManager from '../../Global/DataManager';
import { ExplosionManager } from '../Explosion/ExplosionManager';
import ObjectPoolManager from '../../Global/ObjectPoolManager';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends EntityManager {

    type: EntityTypeEnum;
    id: number
    private targerPos:Vec3;
    private tw:Tween<unknown>;

    init(data: IBullet) {
        this.id = data.id;
        this.node.active = false;
        this.type = data.type;
        this.fsm = this.node.addComponent(BulletStateMachine);
        this.fsm.init(data.type);
        this.state = EntityStateEnum.Idle;
        EventManager.Instance.on(EventEnum.ExplosionBron, this.handleExplosionBron, this);
        this.node.active =false;
        this.targerPos = undefined;
    }


    handleExplosionBron(id: number, { x, y }: IVec2_1) {

        console.info("爆炸触发",id , this.id);
        if (id != this.id) {
            return;
        }

        //从全局获取爆炸节点
        const ndExplosion = ObjectPoolManager.Instance.get(EntityTypeEnum.Explosion);
        const em = ndExplosion.getComponent(ExplosionManager) || ndExplosion.addComponent(ExplosionManager);
        em.init(EntityTypeEnum.Explosion, { x, y });


        //销毁
        EventManager.Instance.off(EventEnum.ExplosionBron, this.handleExplosionBron, this);
        DataManager.Instance.bulletMap.delete(this.id);
        ObjectPoolManager.Instance.ret(this.node);

    }


    render(data: IBullet) {

        this.renderPos(data);
        this.renderDirection(data);
   
    }
    renderPos(data: IBullet){
        const { position, direction } = data;
        const newPos = new Vec3(position.x, position.y);
        if (!this.targerPos) {
            this.node.active = true;
            this.node.setPosition(newPos);
            this.targerPos = new Vec3(newPos);
        } else if (!this.targerPos.equals(newPos)) {

            this.tw?.stop();
            this.node.setPosition(this.targerPos);
            this.targerPos.set(newPos);

            this.tw = tween(this.node)
                .to(0.1, { position: this.targerPos })
                .start();
        }

    }
    renderDirection(data: IBullet){
        const { position, direction } = data;

        //旋转子弹
        const side = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        this.node.angle = direction.x > 0 ? rad2Angle(Math.asin(direction.y / side)) : rad2Angle(Math.asin(-direction.y / side)) + 180;
    }
}