import { animation, AnimationClip, Sprite, SpriteFrame } from "cc";
import DataManager from "../Global/DataManager";
import StateMachine from "./StateMachine";
import { sortSpriteFrame } from "../../Utils";

/***
 * unit:milisecond
 */
export const ANIMATION_SPEED = 1 / 10;

/***
 * 状态（每组动画的承载容器，持有SpriteAnimation组件执行播放）
 */
export default class State {
  private animationClip: AnimationClip;
  constructor(
    private fsm: StateMachine,
    private path: string,
    private wrapMode: AnimationClip.WrapMode = AnimationClip.WrapMode.Normal,
    private force: boolean = false
  ) {
    //生成动画轨道属性
    const track = new animation.ObjectTrack();
    track.path = new animation.TrackPath().toComponent(Sprite).toProperty("spriteFrame");
    const spriteFrames = DataManager.Instance.textureMap.get(this.path);
   // console.info(spriteFrames,this.path,track.path);
    const frames: Array<[number, SpriteFrame]> = sortSpriteFrame(spriteFrames).map((item, index) => [index * ANIMATION_SPEED, item]);
    track.channel.curve.assignSorted(frames);

    //动画添加轨道
    this.animationClip = new AnimationClip();
    this.animationClip.name = this.path;
    this.animationClip.duration = frames.length * ANIMATION_SPEED;
    this.animationClip.addTrack(track);
    this.animationClip.wrapMode = this.wrapMode;
  }

  run() {
    if (this.fsm.animationComponent.defaultClip?.name === this.animationClip.name && !this.force) {
      return;
    }
    this.fsm.animationComponent.defaultClip = this.animationClip;
    this.fsm.animationComponent.play();
  }
}
