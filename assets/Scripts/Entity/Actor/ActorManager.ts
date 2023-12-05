import { _decorator, Component, EventTouch, input, Input, instantiate, math, Node, ProgressBar, tween, Tween, UITransform, Vec2, Vec3 } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityTypeEnum, IAcotor, InputTypeEnum, toFixed } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { ActorStateMachine } from './ActorStateMachine';
import { EntityStateEnum, EventEnum } from '../../Enum';
import { WeaponManager } from '../Weapon/WeaponManager';
import EventManager from '../../Global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('ActorManager')
export class ActorManager extends EntityManager {

    bulletType: EntityTypeEnum;
    id: number;
    hp: ProgressBar;
    private wm: WeaponManager;

    private targerPos: Vec3;
    private tw: Tween<unknown>;



    init(data: IAcotor) {


        this.id = data.id;
        this.bulletType = data.bulletType;
        this.hp = this.node.getComponentInChildren(ProgressBar);
        this.fsm = this.node.addComponent(ActorStateMachine);
        this.fsm.init(data.type);
        this.state = EntityStateEnum.Idle;
        const prefab = DataManager.Instance.prefabMap.get(EntityTypeEnum.Weapon1);

        const ndWewapon = instantiate(prefab);
        this.wm = ndWewapon.addComponent(WeaponManager);
        ndWewapon.parent = this.node;
        this.wm.init(data)
        this.node.active = false;
        this.targerPos = undefined;
    }

    protected onLoad(): void {

    }
    tick(dt: number): void {
        if (this.id != DataManager.Instance.myPlayerId) {
            return;
        }

        if (DataManager.Instance.jm.input.length()) {
            const { x, y } = DataManager.Instance.jm.input;
            EventManager.Instance.emit(EventEnum.CilentSync, {
                type: InputTypeEnum.ActorMove,
                id: DataManager.Instance.myPlayerId,
                direction: {
                    x: toFixed(x),
                    y: toFixed(y)
                },
                dt:toFixed(dt),
            });

            //    this.state = EntityStateEnum.Run;
        } else {
            //    this.state = EntityStateEnum.Idle;
        }
    }


    render(data: IAcotor) {

        this.renderDirection(data);
        this.renderHp(data);
        this.renderPos(data);


    }
    renderHp(data: IAcotor) {
        this.hp.progress = data.hp / this.hp.totalLength;

    }
    renderPos(data: IAcotor) {
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
            this.state = EntityStateEnum.Run;

            this.tw = tween(this.node)
                .to(0.1, { position: this.targerPos })
                .call(() => {
                    this.state = EntityStateEnum.Idle;
                }).start();
        }

    }
    renderDirection(data: IAcotor) {

        const { position, direction } = data;
        if (direction.x != 0) {
            this.node.setScale(direction.x > 0 ? 1 : -1, 1);
            this.hp.node.setScale(direction.x > 0 ? 1 : -1, 1);
        }

        //旋转武器
        const side = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        const radian = Math.asin(direction.y / side);
        const angle = radian / Math.PI * 180;
        this.wm.node.angle = angle;
    }
}