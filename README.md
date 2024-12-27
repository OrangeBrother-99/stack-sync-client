演示地址: https://www.bilibili.com/video/BV1294y1T7k1/ 
# frame-sync-client
帧同步-客户端（房间对战）
# cocos-2d框架、版本：3.6.1
## 使用技术点：
* 有限状态机控制动画播放
* 自定义全局事件监听
* 对象池控制预制体创建
* 资源加载目录
* 数据传输压缩（字符转二进制）：长度130kb 压缩至30b。
* webSocket前后端通信
* 泛型模板控制传参规范
* 网络延迟帧补偿
* 帧浮点数控制多端帧率不一致问题
## 设计模式：单例、观察者
# 文件目录
>\assets\resources 资源文件
>>\assets\resources\prefab 预制体</p>
>>\assets\resources\texture 贴图</p>

>\assets\Scenes 场景文件</p>
>\assets\Scripts 脚本</p>
>>Base 基础文件：有限状态机定义 </p>
>>Common 与服务端定义规范目录 </p>
>>Entity 游戏对象实体脚本控制 </p>
>>Enum  客户端枚举定义 </p>
>>Global 全局脚本定义，用于传递数据 </p>
>>Scenes 场景脚本定义 </p>
>>UI  UI控件脚本定义</p>

>\assets\Utils 工具</p>

# 实现
