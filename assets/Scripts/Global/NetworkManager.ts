import { log } from "cc";
import Singleton from "../Base/Singleton";
import { ApiMessageEnum, IModel, IServerResponse, strdecode, strencode } from "../Common";
// import { binaryEncode } from "../Common/Binary";
interface IItem {
    cb: Function;
    ctx: unknown;
}
export default class NetworkManager extends Singleton {


    static get Instance() {
        return super.GetInstance<NetworkManager>();
    }

    URL: string = "LOCALHOST";
    PORT: number = 8081;

    ws: WebSocket;
    private map: Map<string, Array<IItem>> = new Map();


    isConnected: boolean = false;
    //链接
    connection() {

        return new Promise((res, reject) => {
            if (this.isConnected) {
                res(true);
            }
            this.ws = new WebSocket(`ws:\\${this.URL}:${this.PORT}`);
            this.ws.binaryType = "arraybuffer";
            this.ws.onopen = () => {
                console.log("连接成功");
                this.isConnected = true;
                res(true);
            }
            this.ws.onclose = () => {
                console.log("连接关闭");
                this.isConnected = false;
                reject();
            }
            this.ws.onerror = (e) => {
                console.log("连接异常", e);
                this.isConnected = false;

                reject();
            }
            this.ws.onmessage = (msg) => {
                try {
                    const tb = new Uint8Array(msg.data);
                    const str = strdecode(tb);
                    const json = JSON.parse(str);
                    const { name, data } = json;
                    if (this.map.has(name)) {
                        this.map.get(name).forEach(({ cb, ctx }) => {
                            //console.info("监听消息",json);
                            cb.call(ctx, data);
                        });
                    }
                } catch (e) {
                    console.info("异常消息", msg.data, e);
                }
            }
        });

    }

    async sendMessage<T extends keyof IModel["msg"]>(name: T, data: IModel["msg"][T]) {

        const  msg={name,data}; 
        const  uint8Array = strencode(JSON.stringify(msg));
        const ab = new ArrayBuffer(uint8Array.length);
        const dataView =new DataView(ab);

        for (let index = 0; index < uint8Array.length; index++) {
            dataView.setUint8(index, uint8Array[index]);
        }

        this.ws.send(dataView.buffer);
    }

    listen<T extends keyof IModel["msg"]>(name: T, cb: (args: IModel["msg"][T]) => void, ctx: unknown) {
        if (this.map.has(name)) {
            this.map.get(name).push({ cb, ctx });
        } else {
            this.map.set(name, [{ cb, ctx }]);
        }

    }

    unlisten<T extends keyof IModel["msg"]>(name: T, cb: (args: IModel["msg"][T]) => void, ctx: unknown) {

        if (this.map.has(name)) {
            const index = this.map.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
            index > -1 && this.map.get(name).splice(index, 1);
        }
    }

    callApi<T extends keyof IModel["api"]>(name: T, data: IModel["api"][T]["req"]): Promise<IServerResponse<IModel["api"][T]["res"]>> {
        return new Promise((resolve) => {
            try {
                const timer = setTimeout(() => {
                    resolve({ success: false, error: new Error("timeout !") });
                    this.unlisten(name as any, cb, null);
                }, 5000);
                const cb = (response: any) => {
                  //  console.info("服务端返回",response);
                    if (!response.success) {
                        resolve({ success: false, error: new Error(response.error) });
                    } else {
                        resolve(response);
                    }
                    clearTimeout(timer);
                    this.unlisten(name as any, cb, null);
                }
                this.listen(name as any, cb, null);
                this.sendMessage(name as any, data);
            } catch (error) {
                resolve({ success: false, error: error });
            }
        });
    }

}