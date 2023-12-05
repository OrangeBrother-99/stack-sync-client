import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import NetworkManager from '../Global/NetworkManager';
import { ApiMessageEnum, IMsgGameStartRes, IMsgRoomRes } from '../Common';
import { PlayerManger } from '../UI/PlayerManger';
import DataManager from '../Global/DataManager';
import { SencesEnum } from '../Enum';
import { deepClone } from '../../Utils';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {


    @property(Node)
    playerContainer: Node;

    @property(Prefab)
    playerPrefab: Prefab;


    roomId: number;



    protected onLoad(): void {
        NetworkManager.Instance.listen(ApiMessageEnum.MSG_Room, this.handleRoom, this);
        NetworkManager.Instance.listen(ApiMessageEnum.MSG_GameStart, this.handleStartGame, this);
        this.roomId = DataManager.Instance.roomInfo.roomId;
        director.preloadScene(SencesEnum.Battle);

    }

    protected start(): void {
        this.renderPlayer(DataManager.Instance.roomInfo.players)
    }

    protected onDestroy(): void { 
        NetworkManager.Instance.unlisten(ApiMessageEnum.MSG_Room, this.handleRoom, this);
        NetworkManager.Instance.unlisten(ApiMessageEnum.MSG_GameStart, this.handleStartGame, this);

    }


    handleRoom(res: IMsgRoomRes) {
        console.info("同步房间数据",this.roomId, res);
        if (res.roomId == this.roomId) {
            console.info("房间数据更新玩家", res.players);
            this.renderPlayer(res.players);
        }

    }
    handleStartGame(res: any) {
        console.info("开始游戏",this.roomId, res);
        // if (res.roomId == this.roomId) {
        //     console.info("房间数据更新玩家", res.players);
        //     this.renderPlayer(res.players);
        // }

        DataManager.Instance.state = res;
        DataManager.Instance.lastState = deepClone(res);
        director.loadScene(SencesEnum.Battle);


    }

    renderPlayer(players: any) {
        for (const item of this.playerContainer.children) {
            item.active = false;
        }

        while (this.playerContainer.children.length < players.length) {
            //初始化 预制体
            const node = instantiate(this.playerPrefab);
            node.active = false;
            node.setParent(this.playerContainer);
        }
        for (let i = 0; i < players.length; i++) {
            const item = players[i];
            const node = this.playerContainer.children[i];
            node.getComponent(PlayerManger).init(item);
        }

    }


    async leaveRoom() {
        const { success, res, error } = await NetworkManager.Instance.callApi<ApiMessageEnum.API_LeaveRoom>(ApiMessageEnum.API_LeaveRoom, {roomId: this.roomId});
        if (!success) {
            console.info(error);
            return;
        }
        DataManager.Instance.roomInfo = null;
        director.loadScene(SencesEnum.Hall);
    }

    async startGame () {
        const { success, res, error } = await NetworkManager.Instance.callApi<ApiMessageEnum.API_StartGame>(ApiMessageEnum.API_StartGame, {roomId: this.roomId});
        if (!success) {
            console.info(error);
            return;
        }
      
    }
}

