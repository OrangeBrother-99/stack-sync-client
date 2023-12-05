import { IApiCreateRoomReq, IApiCreateRoomRes, IApiJoinRoomReq, IApiJoinRoomRes, IApiLeaveRoomReq, IApiLeaveRoomRes, IApiLoginReq, IApiLoginRes, IApiPlayerListReq, IApiPlayerListRes, IApiRoomListReq, IApiRoomListRes, IApiStartGameReq, IApiStartGameRes, } from "./Api";
import { ApiMessageEnum } from "./Enum";
import { IMsgClientSyncReq, IMsgGameStartRes, IMsgPlayerSyncRes, IMsgRoomRes, IMsgRoomSyncRes, IMsgServerSyncRes } from "./Msg";

export interface IModel {

    api: {
        [ApiMessageEnum.API_Login]: {
            req: IApiLoginReq,
            res: IApiLoginRes
        },
        [ApiMessageEnum.API_PlayerList]: {
            req: IApiPlayerListReq,
            res: IApiPlayerListRes
        }
        [ApiMessageEnum.API_CreateRoom]: {
            req: IApiCreateRoomReq,
            res: IApiCreateRoomRes
        }
        [ApiMessageEnum.API_RoomList]: {
            req: IApiRoomListReq,
            res: IApiRoomListRes
        }
        [ApiMessageEnum.API_JoinRoom]: {
            req: IApiJoinRoomReq,
            res: IApiJoinRoomRes
        },
        [ApiMessageEnum.API_LeaveRoom]: {
            req: IApiLeaveRoomReq,
            res: IApiLeaveRoomRes
        },
        [ApiMessageEnum.API_StartGame]: {
            req: IApiStartGameReq,
            res: IApiStartGameRes
        }
    }

    msg: {
        [ApiMessageEnum.MSG_ClientSync]: IMsgClientSyncReq,
        [ApiMessageEnum.MSG_ServerSync]: IMsgServerSyncRes,
        [ApiMessageEnum.MSG_PlayerSync]: IMsgPlayerSyncRes,
        [ApiMessageEnum.MSG_RoomSync]: IMsgRoomSyncRes,
        [ApiMessageEnum.MSG_Room]: IMsgRoomRes,
        [ApiMessageEnum.MSG_GameStart]: IMsgGameStartRes,

    }
}