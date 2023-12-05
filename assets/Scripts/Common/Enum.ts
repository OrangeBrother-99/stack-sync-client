export enum  InputTypeEnum{
    ActorMove ="ActorMove",
    WeaponShoot="WeaponShoot",
    //时间移动,
    TimePast="TimePast",
}


export enum EntityTypeEnum{

    Actor1 = "Actor1",
    Actor2 = "Actor2",

    Map = "Map",
    Weapon1 = "Weapon1",
    Weapon2 = "Weapon2",
    Bullet1 = "Bullet1",
    Bullet2 = "Bullet2",
    Explosion = "Explosion",
}

export enum  ApiMessageEnum{
    API_Login= "API_Login",
    API_PlayerList="API_PlayerList",
    API_RoomList="API_RoomList",
    API_CreateRoom="API_CreateRoom",
    API_JoinRoom="API_JoinRoom",
    API_LeaveRoom="API_LeaveRoom",
    API_StartGame="API_StartGame",


    MSG_PlayerSync="MSG_PlayerSync",
    MSG_RoomSync="MSG_RoomSync",
    MSG_Room="MSG_Room",
    MSG_GameStart="MSG_GameStart",
    MSG_ServerSync="MSG_ServerSync",
    MSG_ClientSync="MSG_ClientSync",
}