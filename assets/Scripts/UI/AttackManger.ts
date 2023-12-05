import { _decorator, Component, Node } from 'cc';
import EventManager from '../Global/EventManager';
import { EventEnum } from '../Enum';
const { ccclass, property } = _decorator;

@ccclass('AttackManger')
export class AttackManger extends Component {
  
     shootHandle(){
        EventManager.Instance.emit(EventEnum.WeaponShoot);
     }
}

