import { _decorator, Animation, AnimationClip } from "cc";
import State from "../../Base/State";
import StateMachine, { getInitParamsTrigger } from "../../Base/StateMachine";
import { EntityTypeEnum } from "../../Common";
import { EntityStateEnum, ParamsNameEnum } from "../../Enum";
import ObjectPoolManager from "../../Global/ObjectPoolManager";
const { ccclass } = _decorator;

@ccclass("ExplosionStateMachine")
export class ExplosionStateMachine extends StateMachine {
    init(type: EntityTypeEnum) {
        this.type = type;
        this.animationComponent = this.node.addComponent(Animation);
        this.initParams();
        this.initStateMachines();
        this.initAnimationEvent();
    }

    initParams() {
        this.params.set(ParamsNameEnum.Idle, getInitParamsTrigger());
    }

    initStateMachines() {
        this.stateMachines.set(ParamsNameEnum.Idle, new State(this, `${this.type}${EntityStateEnum.Idle}`, AnimationClip.WrapMode.Normal));
    }

    initAnimationEvent() {
        this.animationComponent.on(Animation.EventType.FINISHED, () => {
            ObjectPoolManager.Instance.ret(this.node);
        });
    }

    run() {
        switch (this.currentState) {
            case this.stateMachines.get(ParamsNameEnum.Idle):

            default:
                this.currentState = this.stateMachines.get(ParamsNameEnum.Idle);
                break;
        }
    }
}
