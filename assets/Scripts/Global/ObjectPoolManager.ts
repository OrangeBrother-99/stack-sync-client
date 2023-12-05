import { Node, instantiate } from "cc";
import Singleton from "../Base/Singleton";
import { EntityTypeEnum } from "../Common";
import DataManager from "./DataManager";

export default class ObjectPoolManager extends Singleton {
    static get Instance() {
        return super.GetInstance<ObjectPoolManager>();
    }


    map: Map<EntityTypeEnum, Node[]> = new Map();

    objectPool: Node;
    get(type: EntityTypeEnum) {

        if (!this.objectPool) {
            this.objectPool = new Node("ObjectPool");
            this.objectPool.setParent(DataManager.Instance.bg);
        }
        if (!this.map.has(type)) {
            this.map.set(type, []);
            const content = new Node(type + "Pool");
            content.setParent(this.objectPool);
        }

        const nodes = this.map.get(type);
        if (!nodes.length) {
            const prefab = DataManager.Instance.prefabMap.get(type);
            const node = instantiate(prefab);

            node.setParent(this.objectPool.getChildByName(type + "Pool"));
            node.name = type;
            node.active = true;

            return node;
        } else {
            const node = nodes.pop();
            node.active = true;
            return node;
        }

    }

    ret(node: Node) {

        node.active = false;
        this.map.get(node.name as EntityTypeEnum).push(node);
    }

}
