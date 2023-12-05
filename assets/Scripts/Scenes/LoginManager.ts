import { _decorator, Component, director, EditBox, Node } from 'cc';
import { SencesEnum } from '../Enum';
import NetworkManager from '../Global/NetworkManager';
import { ApiMessageEnum, IApiLoginReq } from '../Common';
import DataManager from '../Global/DataManager';
const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {

    @property(Node)
    ndNameBox: EditBox;

    protected async onLoad() {
        director.preloadScene(SencesEnum.Hall);


    }

    protected async start() {
        await NetworkManager.Instance.connection();

    }

    async joinGame() {

        if (!this.ndNameBox) {
            return;
        }
        const nick = this.ndNameBox.getComponent(EditBox).string;
        //链接服务器
        if (!nick) {
            return;
        }
        if (!NetworkManager.Instance.isConnected) {
            console.info('尝试连接中...')
            await NetworkManager.Instance.connection();
            return;
        }

        let req: IApiLoginReq = { "nick": nick };
        const { success, res, error } = await NetworkManager.Instance.callApi<ApiMessageEnum.API_Login>(ApiMessageEnum.API_Login, req);
        if (!success) {
            console.info(error);
            return;
        }
        //res 类型推导变成了泛型
        DataManager.Instance.myPlayerId = res.id;
        director.loadScene(SencesEnum.Hall);
    }

}

