import { IPlayer, IRoom } from "./Api"
import { IClietInput, IState } from "./IState"

export  interface  IMsgClientSyncReq{
    data : IClietInput,
    frameId: number
}

export  interface  IMsgServerSyncRes{
    list : IClietInput[],
    frameId: number
}


export  interface  IMsgPlayerSyncRes{
    data : IPlayer[],
}

export interface IMsgRoomSyncRes {
    data: IRoom[],
}

export interface IMsgRoomRes {
    roomId: number,
    players: IPlayer[]
}



export interface IMsgGameStartRes {
    data:IState
}
