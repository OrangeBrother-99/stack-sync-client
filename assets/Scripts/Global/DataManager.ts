import { Node, Prefab, SpriteFrame } from "cc";
import Singleton from "../Base/Singleton";
import { EntityTypeEnum, IAcotor, IActorMove, IBullet, IClietInput, IRoom, IState, InputTypeEnum } from "../Common";
import { ActorManager } from "../Entity/Actor/ActorManager";
import { JoystickManager } from "../UI/JoystickManager";
import { BulletManager } from "../Entity/Bullet/BulletManager";
import EventManager from "./EventManager";
import { EventEnum } from "../Enum";
import { seedRandom } from "../../Utils";
const ACTOR_SPEED = 100;
const BULLET_SPEED = 600;

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 640;

const ACHOR_RADIUS = 25;
const BULLET_RADIUS = 25;

const BULLET_DAMAGE = 20;
export default class DataManager extends Singleton {


    static get Instance() {
        return super.GetInstance<DataManager>();
    }

    jm: JoystickManager;

    myPlayerId: number = 1;
    frameId: number = 1;

    bg: Node;

    roomInfo: IRoom;

    actorMap: Map<number, ActorManager> = new Map();
    bulletMap: Map<number, BulletManager> = new Map();
    prefabMap: Map<String, Prefab> = new Map();
    textureMap: Map<String, SpriteFrame[]> = new Map();

    lastState: IState;

    state: IState = {
        actors: [ // {

            //     id: 1,
            //     hp:50,
            //     type: EntityTypeEnum.Actor1,
            //     weaponType: EntityTypeEnum.Weapon1,
            //     bulletType: EntityTypeEnum.Bullet2,
            //     position: {
            //         x: 50, y: 50
            //     },
            //     direction: {
            //         x: 1, y: 0
            //     }
            // },
            // {
            //     id: 2,
            //     hp:50,
            //     type: EntityTypeEnum.Actor1,
            //     weaponType: EntityTypeEnum.Weapon1,
            //     bulletType: EntityTypeEnum.Bullet2,
            //     position: {
            //         x: -150, y: 50
            //     },
            //     direction: {
            //         x: -1, y: 0
            //     }

            // }
        ],
        bullets: [],
        nextBulletId: 1,
        seed: 1,
    }

    applyInput(input: IClietInput) {

        switch (input.type) {


            case InputTypeEnum.ActorMove:
                const { id, dt, direction: { x, y } } = input;
                const actor = this.state.actors.find(actor => actor.id === id);
                console.info("玩家移动:", actor.id, input)
                actor.direction.y = y;
                actor.direction.x = x;
                actor.position.x += x * dt * ACTOR_SPEED;
                actor.position.y += y * dt * ACTOR_SPEED;
                break;
            case InputTypeEnum.WeaponShoot:
                const { position, owner, direction } = input;

                //console.info("收到武器发射子弹事件数据", input);
                if (!this.state.bullets) {
                    this.state.bullets = [];
                }
                if (!this.state.nextBulletId) {
                    this.state.nextBulletId = 1;
                }
                const bullet: IBullet = {
                    id: this.state.nextBulletId++,
                    owner, position, direction,
                    type: this.actorMap.get(owner).bulletType
                };
                //广播发射子弹事件
                EventManager.Instance.emit(EventEnum.BulletShoot, owner);
                this.state.bullets.push(bullet);
                //console.info("子弹：",DataManager.Instance.state.bullets);
                //console.info("发射子弹", bullet);
                break;
            case InputTypeEnum.TimePast:
                //  console.info("帧同步",input)
                const time = input.dt;
                const { bullets, actors } = this.state;
                if (!bullets || bullets.length < 1) {
                    return;
                }
                for (let item of bullets) {
                    item.position.x += time * item.direction.x * BULLET_SPEED;
                    item.position.y += time * item.direction.y * BULLET_SPEED;
                }
                //限制移动
                for (let i = bullets.length - 1; i >= 0; i--) {
                    const bullet = bullets[i];
                    //console.info("我是玩家：", this.myPlayerId, "子弹：", bullet.owner);
                    for (let j = actors.length - 1; j >= 0; j--) {
                        const actor = actors[j];
                        //子弹判断： 自己发射的不能命中自己，别人发射的不能命中别人自身
                        if (this.myPlayerId == bullet.owner && this.myPlayerId == actor.id) {
                            continue;
                        }
                        if (bullet.owner == actor.id) {
                            continue;
                        }
                        const result = (actor.position.x - bullet.position.x) ** 2 + (actor.position.y - bullet.position.y) ** 2 < (BULLET_RADIUS + ACHOR_RADIUS) ** 2;
                        // console.info("碰撞判断：", result);
                        //距离判定
                        if (result) {
                            const random = seedRandom(this.state.seed);
                            const damage = random / 233280 >= 0.5 ? BULLET_DAMAGE * 2 : BULLET_DAMAGE;
                            actor.hp -= damage;
                            EventManager.Instance.emit(EventEnum.ExplosionBron, bullet.id,
                                {
                                    x: (actor.position.x + bullet.position.x) / 2,
                                    y: (actor.position.y + bullet.position.y) / 2
                                })
                            bullets.splice(i, 1);
                            break;
                        }


                    }
                    if (Math.abs(bullet.position.x) > VIEW_WIDTH / 2 || Math.abs(bullet.position.y) > VIEW_HEIGHT / 2) {
                        //   console.info("命中墙体")
                        EventManager.Instance.emit(EventEnum.ExplosionBron, bullet.id, { x: bullet.position.x, y: bullet.position.y })
                        bullets.splice(i, 1);
                        break;
                    }
                }

            default: break;
        }

    }
}