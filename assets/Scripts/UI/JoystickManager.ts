import { _decorator, Component, EventTouch, input, Input, Node, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JoystickManager')
export class JoystickManager extends Component {

    private body: Node;
    private joystick: Node;

    private defaultJoystickPos: Vec3;
    private raduis: number;
    //return params
    input: Vec3 = Vec3.ZERO;
    onLoad() {
        this.body = this.node.getChildByName("Body");
        this.joystick = this.body.getChildByName("Stick");
        this.raduis = this.body.getComponent(UITransform).contentSize.x / 2;
        this.defaultJoystickPos = new Vec3(this.body.position.x, this.body.position.y);
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);

    }

    onTouchStart(event: EventTouch) {
        const pos = event.getUILocation()
        this.body.setPosition(pos.x, pos.y);
    }
    onTouchMove(event: EventTouch) {
        const pos = event.getUILocation()
        const stickPos = new Vec3(pos.x - this.body.position.x, pos.y - this.body.position.y);
        if (stickPos.length() > this.raduis) {
            stickPos.multiplyScalar(this.raduis / stickPos.length());
        }
        this.joystick.setPosition(stickPos);

        //归一化
        this.input = stickPos.clone().normalize();

    }

    onTouchEnd() {
        this.body.setPosition(this.defaultJoystickPos);
        this.joystick.setPosition(0, 0);
        this.input = Vec3.ZERO;
    }
}

