import { ApiMessageEnum, InputTypeEnum } from "./Enum";
import { strdecode, strencode, toFixed } from "./Utils";

const encodeActorMove = (input: any, view: DataView, index: number) => {
  view.setUint8(index++, input.type)
  view.setUint8(index++, input.id)
  view.setFloat32(index, input.direction.x)
  index += 4
  view.setFloat32(index, input.direction.y)
  index += 4
  view.setFloat32(index, input.dt)
  index += 4
}

const encodeWeaponShoot = (input: any, view: DataView, index: number) => {
  view.setUint8(index++, input.type)
  view.setUint8(index++, input.owner)
  view.setFloat32(index, input.position.x)
  index += 4
  view.setFloat32(index, input.position.y)
  index += 4
  view.setFloat32(index, input.direction.x)
  index += 4
  view.setFloat32(index, input.direction.y)
  index += 4
}

export const encodeTimePast = (input: any, view: DataView, index: number) => {
  view.setUint8(index++, input.type)
  view.setFloat32(index, input.dt)
  index += 4
}

export const binaryEncode = (name: ApiMessageEnum, data: any): DataView => {
  if (name === ApiMessageEnum.MSG_ClientSync) {
    //name 1字节 + frameId 4字节 + 数据长度 n 字节
    const { frameId, input } = data
    if (input.type === InputTypeEnum.ActorMove) {
      let index = 0
      const ab = new ArrayBuffer(1 + 4 + 14)
      const view = new DataView(ab)
      view.setUint8(index++, name)
      view.setUint32(index, frameId)
      index += 4
      encodeActorMove(input, view, index)
      return view
    } else if (input.type === InputTypeEnum.WeaponShoot) {
      let index = 0
      const ab = new ArrayBuffer(1 + 4 + 18)
      const view = new DataView(ab)
      view.setUint8(index++, name)
      view.setUint32(index, frameId)
      index += 4
      encodeWeaponShoot(input, view, index)
      return view
    } else {
      let index = 0
      const ab = new ArrayBuffer(1 + 4 + 5)
      const view = new DataView(ab)
      view.setUint8(index++, name)
      view.setUint32(index, frameId)
      index += 4
      encodeTimePast(input, view, index)
      return view
    }
  } else if (name === ApiMessageEnum.MSG_ServerSync) {
    const { lastFrameId, inputs } = data
    let total = 0
    for (const input of inputs) {
      if (input.type === InputTypeEnum.ActorMove) {
        total += 14
      } else if (input.type === InputTypeEnum.WeaponShoot) {
        total += 18
      } else {
        total += 5
      }
    }
    //name 1字节 + lastFrameId 4字节 + 数组长度 1字节 + 数据长度 n 字节
    const ab = new ArrayBuffer(1 + 4 + 1 + total)
    const view = new DataView(ab)
    let index = 0
    view.setUint8(index++, name)
    view.setUint32(index, lastFrameId)
    index += 4
    view.setUint8(index++, inputs.length)
    for (const input of inputs) {
      if (input.type === InputTypeEnum.ActorMove) {
        encodeActorMove(input, view, index)
        index += 14
      } else if (input.type === InputTypeEnum.WeaponShoot) {
        encodeWeaponShoot(input, view, index)
        index += 18
      } else {
        encodeTimePast(input, view, index)
        index += 5
      }
    }
    return view
  } else {
    let index = 0
    const str = JSON.stringify(data)
    const ta = strencode(str)
    const ab = new ArrayBuffer(ta.length + 1)
    const view = new DataView(ab)
    view.setUint8(index++, name)
    for (let i = 0; i < ta.length; i++) {
      view.setUint8(index++, ta[i])
    }
    return view
  }
}

const decodeActorMove = (view: DataView, index: number) => {
  const id = view.getUint8(index++)
  const directionX = toFixed(view.getFloat32(index))
  index += 4
  const directionY = toFixed(view.getFloat32(index))
  index += 4
  const dt = toFixed(view.getFloat32(index))
  index += 4
  const input = {
    type: InputTypeEnum.ActorMove,
    id,
    direction: {
      x: directionX,
      y: directionY,
    },
    dt
  }

  return input
}

const decodeWeaponShoot = (view: DataView, index: number) => {
  const owner = view.getUint8(index++)
  const positionX = toFixed(view.getFloat32(index))
  index += 4
  const positionY = toFixed(view.getFloat32(index))
  index += 4
  const directionX = toFixed(view.getFloat32(index))
  index += 4
  const directionY = toFixed(view.getFloat32(index))
  index += 4
  const input = {
    type: InputTypeEnum.WeaponShoot,
    owner,
    position: {
      x: positionX,
      y: positionY,
    },
    direction: {
      x: directionX,
      y: directionY,
    },
  }
  return input
}

const decodeTimePast = (view: DataView, index: number) => {
  const dt = toFixed(view.getFloat32(index))
  index += 4
  const input = {
    type: InputTypeEnum.TimePast,
    dt,
  }
  return input
}

export const binaryDecode = (buffer: ArrayBuffer) => {
  let index = 0
  const view = new DataView(buffer)
  const name = view.getUint8(index++)

  if (name === ApiMessageEnum.MSG_ClientSync) {
    const frameId = view.getUint32(index)
    index += 4
    const inputType = view.getUint8(index++)
    if (inputType === InputTypeEnum.ActorMove) {
      const input = decodeActorMove(view, index)
      return {
        name,
        data: {
          frameId,
          input
        }
      }
    } else if (inputType === InputTypeEnum.WeaponShoot) {
      const input = decodeWeaponShoot(view, index)
      return {
        name,
        data: {
          frameId,
          input
        }
      }
    } else {
      const input = decodeTimePast(view, index)
      return {
        name,
        data: {
          frameId,
          input
        }
      }
    }
  } else if (name === ApiMessageEnum.MSG_ServerSync) {
    const lastFrameId = view.getUint32(index)
    index += 4
    const len = view.getUint8(index++)
    const inputs = []
    for (let i = 0; i < len; i++) {
      const inputType = view.getUint8(index++)
      if (inputType === InputTypeEnum.ActorMove) {
        inputs.push(decodeActorMove(view, index))
        index += 13
      } else if (inputType === InputTypeEnum.WeaponShoot) {
        inputs.push(decodeWeaponShoot(view, index))
        index += 17
      } else {
        inputs.push(decodeTimePast(view, index))
        index += 4
      }
    }
    return {
      name: ApiMessageEnum.MSG_ServerSync,
      data: {
        lastFrameId,
        inputs
      }
    }
  } else {
    return {
      name: name,
      data: JSON.parse(strdecode(new Uint8Array(buffer.slice(1))))
    }
  }
}