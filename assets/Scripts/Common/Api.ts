import { input } from "cc"

export interface IPlayer {
    id: number,
    nickName: string
}

export interface IRoom {
    roomId: number,
    players: IPlayer[]
}

export interface IApiLoginReq {
    nick: string,
}

export interface IApiLoginRes {
    id: number,
    nickName: string
 
}

export interface IApiPlayerListReq {

}

export interface IApiPlayerListRes {
    data: IPlayer[],
}




export interface IApiCreateRoomReq {

}

export interface IApiCreateRoomRes {
    roomId: number,
    players: IPlayer[]
}


export interface IApiRoomListReq {

}

export interface IApiRoomListRes {
    data: IRoom[],
}
export interface IApiJoinRoomReq {

     roomId: number,
}

export interface IApiJoinRoomRes {
    roomId: number,
    players: IPlayer[]
}
export interface IApiLeaveRoomReq {

     roomId: number,
}

export interface IApiLeaveRoomRes {
  

}

export interface IApiStartGameReq {
    roomId: number,
}

export interface IApiStartGameRes {
 

}
