import { _decorator, Component, EventTouch, input, Input, Node, UITransform, Vec2, Vec3 } from 'cc';
import DataManager from '../../Global/DataManager';
import { IAcotor, InputTypeEnum, toFixed } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { EntityStateEnum, EventEnum } from '../../Enum';
import { WeaponStateMachine } from './WeaponStateMachine';
import EventManager from '../../Global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('WeaponManager')
export class WeaponManager extends EntityManager {


    private ndBody: Node;
    private ndAchor: Node;
    private ndPoint: Node;
    owerId: number;
    init(data: IAcotor) {

        this.ndBody = this.node.getChildByName('Body');
        this.ndAchor = this.ndBody.getChildByName('Achor');
        this.ndPoint = this.ndAchor.getChildByName('Point');

        this.fsm = this.ndBody.addComponent(WeaponStateMachine);
        this.fsm.init(data.weaponType);
        this.state = EntityStateEnum.Idle;
        this.owerId = data.id;


        EventManager.Instance.on(EventEnum.WeaponShoot, this.handleWeaponShoot, this);
        EventManager.Instance.on(EventEnum.BulletShoot, this.handleBulletBorn, this);

    }
    protected onDestroy(): void {
        EventManager.Instance.off(EventEnum.WeaponShoot, this.handleWeaponShoot, this);
        EventManager.Instance.off(EventEnum.BulletShoot, this.handleBulletBorn, this);


    }

    handleBulletBorn(owner: number) {
        if (owner != this.owerId) {
            return;
        }
        this.state = EntityStateEnum.Attack;
    }
    handleWeaponShoot() {
        if (this.owerId != DataManager.Instance.myPlayerId) {
            return;
        }
        const pointWorldPos = this.ndPoint.getWorldPosition();
        const achorWorldPos = this.ndAchor.getWorldPosition();

        const pointPos = DataManager.Instance.bg.getComponent(UITransform).convertToNodeSpaceAR(pointWorldPos);
        const direction = new Vec2(pointWorldPos.x - achorWorldPos.x, pointWorldPos.y - achorWorldPos.y).normalize();

        // DataManager.Instance.applyInput({
        //     type: InputTypeEnum.WeaponShoot,
        //     owner: this.owerId,
        //     position: {
        //         x: pointPos.x, y: pointPos.y
        //     },
        //     direction: {
        //         x: direction.x, y: direction.y
        //     },
        // })

        EventManager.Instance.emit(EventEnum.CilentSync, {
            type: InputTypeEnum.WeaponShoot,
            owner: this.owerId,
            direction: {
                x: toFixed(direction.x), y: toFixed(direction.y)
            },
            position: {
                x: toFixed(pointPos.x), y: toFixed(pointPos.y)
            },
        });
    }
}