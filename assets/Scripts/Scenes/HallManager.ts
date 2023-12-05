import { _decorator, Component, director, EditBox, instantiate, Node, Prefab } from 'cc';
import { SencesEnum } from '../Enum';
import NetworkManager from '../Global/NetworkManager';
import { ApiMessageEnum, IApiPlayerListRes, IPlayer, IRoom } from '../Common';
import DataManager from '../Global/DataManager';
import { PlayerManger } from '../UI/PlayerManger';
import { RoomManager } from '../UI/RoomManager';
const { ccclass, property } = _decorator;

@ccclass('HallManager')
export class HallManager extends Component {


    @property(Node)
    playerContainer: Node;

    @property(Prefab)
    playerPrefab: Prefab;


    @property(Node)
    roomContainer: Node;

    @property(Prefab)
    roomPrefab: Prefab;


    protected onLoad(): void {
        NetworkManager.Instance.listen(ApiMessageEnum.MSG_PlayerSync, this.renderPlayer, this);
        NetworkManager.Instance.listen(ApiMessageEnum.MSG_RoomSync, this.renderRoom, this);

        //预加载
        director.preloadScene(SencesEnum.Room);

    }

    protected start(): void {

        //清楚测试节点
        this.playerContainer.destroyAllChildren();

        this.getPlayers();
        this.getRooms();
    }

    protected onDestroy(): void {
        NetworkManager.Instance.unlisten(ApiMessageEnum.MSG_PlayerSync, this.renderPlayer, this);
        NetworkManager.Instance.unlisten(ApiMessageEnum.MSG_RoomSync, this.renderRoom, this);

    }
    async getPlayers() {
        const { success, res, error } = await NetworkManager.Instance.callApi<ApiMessageEnum.API_PlayerList>(ApiMessageEnum.API_PlayerList, {});
        if (!success) {
            console.info(error);
            return;
        }
        //res 返回为解构出大数组列表
        this.renderPlayer(res);
    }

    async getRooms() {
        const { success, res, error } = await NetworkManager.Instance.callApi<ApiMessageEnum.API_RoomList>(ApiMessageEnum.API_RoomList, {});
        if (!success) {
            console.info(error);
            return;
        }
        //res 返回为解构出大数组列表
        this.renderRoom(res);
    }

    renderPlayer(res: any) {
        for (const item of this.playerContainer.children) {
            item.active = false;
        }

        while (this.playerContainer.children.length < res.length) {
            //初始化 预制体
            const node = instantiate(this.playerPrefab);
            node.active = false;
            node.setParent(this.playerContainer);
        }
        for (let i = 0; i < res.length; i++) {
            const item = res[i];
            const node = this.playerContainer.children[i];
            node.getComponent(PlayerManger).init(item);
        }

    }


    renderRoom(res: any) {
        for (const item of this.roomContainer.children) {
            item.active = false;
        }

        while (this.roomContainer.children.length < res.length) {
            //初始化 预制体
            const node = instantiate(this.roomPrefab);
            node.active = false;
            node.setParent(this.roomContainer);
        }
        for (let i = 0; i < res.length; i++) {
            const item = res[i];
            const node = this.roomContainer.children[i];
            node.getComponent(RoomManager).init(item);
        }

    }

    async handleCreateRoom() {
        const { success, res, error } = await NetworkManager.Instance.callApi<ApiMessageEnum.API_CreateRoom>(ApiMessageEnum.API_CreateRoom, {});
        if (!success) {
            console.info(error);
            return;
        }
        // console.info("创建房间：", res);
        DataManager.Instance.roomInfo = res;
        // console.info("创建后：", DataManager.Instance.roomInfo);
        director.loadScene(SencesEnum.Room);
    }
}

