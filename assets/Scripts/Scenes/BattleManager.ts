import { _decorator, Component, instantiate, Node, Prefab, SpriteFrame, } from 'cc';
import DataManager from '../Global/DataManager';
import { JoystickManager } from '../UI/JoystickManager';
import { ResourceManager } from '../Global/ResourceManager';
import { ActorManager } from '../Entity/Actor/ActorManager';
import { EventEnum, PathPrefabEnum, PathTextureEnum } from '../Enum';
import { ApiMessageEnum, EntityTypeEnum, IClietInput, InputTypeEnum } from '../Common';
import EventManager from '../Global/EventManager';
import { BulletManager } from '../Entity/Bullet/BulletManager';
import ObjectPoolManager from '../Global/ObjectPoolManager';
import NetworkManager from '../Global/NetworkManager';
const { ccclass, property } = _decorator;
import { IMsgClientSyncReq } from "../Common/Msg";
import { deepClone } from '../../Utils';

@ccclass('BattleManager')
export class BattleManager extends Component {
    private ndBg: Node;
    private ndUi: Node;

    shouldRender: boolean = false;

    pendingMsg: IMsgClientSyncReq[] = [];

    protected async start() {
        this.clearGame();
        await Promise.all([this.loadRes(), this.connectServer()]);
        // NetworkManager.Instance.callApi(ApiMessageEnum.API_Login, { "nick": "你好" } );
        // NetworkManager.Instance.listen("msg", (data) => {
        //     console.info(data);
        // }, this);
        this.initGame();
    }

    initGame() {
        DataManager.Instance.jm = this.ndUi.getComponentInChildren(JoystickManager);
        EventManager.Instance.on(EventEnum.CilentSync, this.handleClientSync, this);
        this.initMap();
        this.shouldRender = true;
        NetworkManager.Instance.listen(ApiMessageEnum.MSG_ServerSync, this.handleServerSync, this);
        EventManager.Instance.on(EventEnum.HitAttack, this.hitAttackHandle, this);

    }
    clearGame() {
        DataManager.Instance.bg = this.ndBg = this.node.getChildByName("BG");
        this.ndUi = this.node.getChildByName("UI");
        this.ndBg.removeAllChildren();
        EventManager.Instance.off(EventEnum.CilentSync, this.handleClientSync, this);
        NetworkManager.Instance.unlisten(ApiMessageEnum.MSG_ServerSync, this.handleServerSync, this);
        EventManager.Instance.off(EventEnum.HitAttack, this.hitAttackHandle, this);

    }
    async connectServer() {
        if (NetworkManager.Instance.isConnected) {
            return;
        }
        if (!await NetworkManager.Instance.connection().catch(() => false)) {
            await new Promise((rs) => setTimeout(rs, 1000));
            await this.connectServer();
        }
    }

    handleClientSync(data: IClietInput) {

        const msg = { data, frameId: DataManager.Instance.frameId++ };

        if (data.type === InputTypeEnum.ActorMove) {
            DataManager.Instance.applyInput(data);
            this.pendingMsg.push(msg);
        }    
        NetworkManager.Instance.sendMessage(ApiMessageEnum.MSG_ClientSync, msg);

    }


    //IMsgServerSyncRes
    handleServerSync(data: any) {

        // //记录上一次服务端状态
        DataManager.Instance.state = DataManager.Instance.lastState;
        for (let input of data.list) {
            DataManager.Instance.applyInput(input);
        }

        //回滚
        DataManager.Instance.lastState = deepClone(DataManager.Instance.state);
        //过滤出服务端还不能收到的信息作为客户端的 输入
        this.pendingMsg = this.pendingMsg.filter((v) => v.frameId > data.frameId);
        for (let msg of this.pendingMsg) {
            DataManager.Instance.applyInput(msg.data);
        }


    }
    initMap() {
        //不存在进行初始化
        const actor = DataManager.Instance.prefabMap.get(EntityTypeEnum.Map);
        const ndActor = instantiate(actor);
        ndActor.setParent(this.ndBg);
    }


    async loadRes() {
        const list = [];
        for (let em in PathPrefabEnum) {
            const promise = ResourceManager.Instance.loadRes(PathPrefabEnum[em], Prefab).then((prefab) => {
                DataManager.Instance.prefabMap.set(em, prefab);
            });
            list.push(promise);
        }

        for (let em in PathTextureEnum) {
            const promise = ResourceManager.Instance.loadDir(PathTextureEnum[em], SpriteFrame).then((spriteFrames) => {
                DataManager.Instance.textureMap.set(em, spriteFrames);
            });
            list.push(promise);
        }
        await Promise.all(list);
    }

    protected update(dt: number): void {
        if (!this.shouldRender) {
            return;
        }
        //渲染玩家移动
        this.render();
        this.tick(dt);
    }

    //========触发动作

    tick(dt: number) {
        this.actorTick(dt);
    }
    render() {
        this.renderActor();
        this.renderBullet();
    }


    ///=========玩家模块
    actorTick(dt: number) {
        for (let data of DataManager.Instance.state.actors) {
            const { id } = data;
            //检查玩家节点 
            let am = DataManager.Instance.actorMap.get(id);
            am.tick(dt);
        }
    }
    async renderActor() {
        //遍历需要玩家列表
        for (let data of DataManager.Instance.state.actors) {
            const { id, type } = data;
            //检查玩家节点 
            let am = DataManager.Instance.actorMap.get(id);
            if (!am) {
                //不存在进行初始化
                const actor = DataManager.Instance.prefabMap.get(type);
                const ndActor = instantiate(actor);
                ndActor.setParent(this.ndBg);

                // console.info(ndActor.getComponent(UITransform).width, ndActor.getComponent(UITransform).height);
                //挂载脚本
                am = ndActor.addComponent(ActorManager);
                DataManager.Instance.actorMap.set(data.id, am);
                //初始数据
                am.init(data);
            } else {
                am.render(data);
            }
        }
    }

    async renderBullet() {
        //遍历子弹
        if (!DataManager.Instance.state.bullets || DataManager.Instance.state.bullets.length == 0) {
            return;
        }
        for (let data of DataManager.Instance.state.bullets) {
            const { id, type } = data;
            //检查玩家节点 
            let bm = DataManager.Instance.bulletMap.get(id);
            if (!bm) {
                //不存在进行初始化
                const ndBullet = ObjectPoolManager.Instance.get(type);
                //挂载脚本
                bm = ndBullet.getComponent(BulletManager) || ndBullet.addComponent(BulletManager);
                DataManager.Instance.bulletMap.set(data.id, bm);
                //初始数据
                bm.init(data);
            } else {
                bm.render(data);
            }
        }
    }

    
    hitAttackHandle(){
        
        //伤害跳字
    }
}