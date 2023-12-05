import { EntityTypeEnum, InputTypeEnum } from "./Enum";

export interface IVec2_1 {

    x: number;
    y: number;
}

export interface IState {
    actors: IAcotor[];
    bullets: IBullet[];
    nextBulletId: number;
    seed:number;
}
export interface IBullet {
    owner: number;
    id: number;
    position: IVec2_1;
    direction: IVec2_1;
    type: EntityTypeEnum;

}
export interface IAcotor {
    id: number;
    hp:number;
    position: IVec2_1;
    direction: IVec2_1;
    type: EntityTypeEnum;
    weaponType: EntityTypeEnum;
    bulletType: EntityTypeEnum;

}

export interface IActorMove {
    type: InputTypeEnum.ActorMove,
    id: number,
    direction: IVec2_1,
    dt: number,
}
export interface IWeaponShoot {
    type: InputTypeEnum.WeaponShoot,
    owner: number,
    position: IVec2_1,
    direction: IVec2_1,
}
export interface ITimePast {
    type: InputTypeEnum.TimePast,
    dt: number
}

export interface IServerResponse<T>{
    success:boolean,
    res?: T,
    error?: Error,
}

export type IClietInput = IActorMove | IWeaponShoot | ITimePast;