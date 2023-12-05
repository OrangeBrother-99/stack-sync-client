import { _decorator, Component, director, Label } from 'cc';
import { ApiMessageEnum, IRoom } from '../Common';
import NetworkManager from '../Global/NetworkManager';
import { SencesEnum } from '../Enum';
import DataManager from '../Global/DataManager';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
    roomId: number;
    init(room: IRoom) {
        this.node.active = true;
        const lb = this.node.getComponent(Label);
        lb.string = `房间号：${room.roomId}  人数：${room.players.length}`;

        this.roomId = room.roomId;
    }

    async joinRoom() {
        const { success, res, error } = await NetworkManager.Instance.callApi<ApiMessageEnum.API_JoinRoom>(ApiMessageEnum.API_JoinRoom, { roomId: this.roomId });
        if (!success) {
            console.info(error);
            return;
        }
       DataManager.Instance.roomInfo = res;
       director.loadScene(SencesEnum.Room)

    }

}

