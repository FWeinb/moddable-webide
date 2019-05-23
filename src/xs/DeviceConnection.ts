import Emittery from 'emittery';

export type ConnectionEvent<T, V> = {
  type: T;
  value: V;
};

const crlf = String.fromCharCode(13) + String.fromCharCode(10);

export type XsbugProperty = {
  name: string;
  value: string;
  flags: {
    value: string;
    delete: boolean;
    enum: boolean;
    set: boolean;
  };
  properties?: Array<XsbugProperty>;
};

export type XsbugFrame = {
  name: string;
  value: string;
  path?: string;
  line?: number;
};

export enum XsbugMessageType {
  Login = 'LOGIN',
  Frames = 'FRAMES',
  Local = 'LOCAL',
  Global = 'GLOBAL',
  Grammer = 'GRAMMER',
  Break = 'BREAK',
  Log = 'LOG',
  InstrumentSample = 'INSTRUMENT_SAMPLE',
  Instrument = 'INSTRUMENT'
}

export type XsbugMessage<V> = ConnectionEvent<XsbugMessageType, V>;

export type XsbugLoginMessage = XsbugMessage<{
  name: string;
  value: string;
}>;

export type XsbugFramesMessage = XsbugMessage<{
  frames: Array<XsbugFrame>;
}>;

export type XsbugLocalMessage = XsbugMessage<{
  frame: XsbugFrame;
  properties: Array<XsbugProperty>;
}>;

export type XsbugGlobalMessage = XsbugMessage<{
  properties: Array<XsbugProperty>;
}>;

export type XsbugGrammerMessage = XsbugMessage<{
  properties: Array<XsbugProperty>;
}>;

export type XsbugBreakMessage = XsbugMessage<{
  path: string;
  line: number;
  message: string;
}>;

export type XsbugLogMessage = XsbugMessage<{
  log: string;
}>;

export type XsbugInstrumentSampleMessage = XsbugMessage<{
  samples: Array<number>;
}>;

export type XsbugInstrumentMessage = XsbugMessage<{
  instruments: Array<{ name: string; value: string }>;
}>;

const XsbugParseFrame = (node): XsbugFrame => {
  const frame: XsbugFrame = {
    name: node.attributes.name.value,
    value: node.attributes.value && node.attributes.value.value
  };
  if (node.attributes.path) {
    frame.path = node.attributes.path.value;
    frame.line = parseInt(node.attributes.line.value);
  }
  return frame;
};

const XsbugParseProperty = (node): XsbugProperty => {
  const flags = node.attributes.flags.value;
  const property: XsbugProperty = {
    name: node.attributes.name.value,
    value: String(node.attributes.value && node.attributes.value.value),
    flags: {
      value: flags,
      delete: flags.indexOf('C') < 0,
      enum: flags.indexOf('E') < 0,
      set: flags.indexOf('W') < 0
    }
  };

  if (node.firstChild) {
    property.properties = [];
    for (let p = node.firstChild; p; p = p.nextSibling)
      property.properties.push(XsbugParseProperty(p));
    property.properties.sort((a, b) => a.name.localeCompare(b.name));
  }

  return property;
};

const XsbugTypeParser = {
  login(node): XsbugLoginMessage {
    return {
      type: XsbugMessageType.Login,
      value: {
        name: node.attributes.name.value,
        value: node.attributes.value.value
      }
    };
  },
  samples(node): XsbugInstrumentSampleMessage {
    return {
      type: XsbugMessageType.InstrumentSample,
      value: {
        samples: node.textContent.split(',').map(value => parseInt(value))
      }
    };
  },
  frames(node): XsbugFramesMessage {
    let frames = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
      frames.push(XsbugParseFrame(node));
    }
    return {
      type: XsbugMessageType.Frames,
      value: {
        frames
      }
    };
  },
  local(node): XsbugLocalMessage {
    const frame = XsbugParseFrame(node);
    let properties = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
      properties.push(XsbugParseProperty(node));
    }
    properties.sort((a, b) => a.name.localeCompare(b.name));
    return {
      type: XsbugMessageType.Local,
      value: {
        frame,
        properties
      }
    };
  },
  global(node): XsbugGlobalMessage {
    const global = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
      global.push(XsbugParseProperty(node));
    }
    global.sort((a, b) => a.name.localeCompare(b.name));
    return {
      type: XsbugMessageType.Global,
      value: {
        properties: global
      }
    };
  },
  grammar(node): XsbugGrammerMessage {
    const grammer = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
      grammer.push(XsbugParseProperty(node));
    }
    grammer.sort((a, b) => a.name.localeCompare(b.name));
    return {
      type: XsbugMessageType.Grammer,
      value: {
        properties: grammer
      }
    };
  },
  break(node): XsbugBreakMessage {
    return {
      type: XsbugMessageType.Break,
      value: {
        path: node.attributes.path.value,
        line: parseInt(node.attributes.line.value),
        message: node.textContent
      }
    };
  },
  log(node): XsbugLogMessage {
    return {
      type: XsbugMessageType.Log,
      value: {
        log: node.textContent
      }
    };
  },
  instruments(node): XsbugInstrumentMessage {
    let instruments = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
      instruments.push({
        name: node.attributes.name.value,
        value: node.attributes.value.value
      });
    }
    return {
      type: XsbugMessageType.Instrument,
      value: {
        instruments
      }
    };
  }
};

const XsbugMessageParser = (xml: Document): Array<XsbugMessage<any>> => {
  const root = xml.documentElement;
  if ('xsbug' !== root.nodeName) throw new Error('not xsbug xml');
  const messages = [];
  for (let node: Node = root.firstChild; node; node = node.nextSibling) {
    try {
      messages.push(XsbugTypeParser[node.nodeName](node));
    } catch (e) {
      if (node && node.nodeName === 'parsererror') {
        throw new Error(
          `Malformed data encountered, please try reconnecting to the device.`
        );
      }
      throw e;
    }
  }
  return messages;
};

type InstallCallback = (code: number) => void;
type ReplyCallback = (code: number, data: ArrayBuffer) => void;
type PendingRequest = {
  id: number;
  callback: ReplyCallback;
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (value?: any) => void;
};

function createDeferred<T>(): Deferred<T> {
  return (() => {
    let resolve: (value?: T | PromiseLike<T>) => void;
    let reject: (value?: any) => void;

    let p = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return {
      promise: p,
      reject,
      resolve
    };
  })();
}

export type DebugBreakpoint = {
  path: string;
  line: number;
};

export type DeviceDebuggerEvents = {
  [XsbugMessageType.Login]: XsbugLoginMessage;
  [XsbugMessageType.Frames]: XsbugFramesMessage;
  [XsbugMessageType.Local]: XsbugLocalMessage;
  [XsbugMessageType.Global]: XsbugGlobalMessage;
  [XsbugMessageType.Grammer]: XsbugGrammerMessage;
  [XsbugMessageType.Break]: XsbugBreakMessage;
  [XsbugMessageType.Log]: XsbugLogMessage;
  [XsbugMessageType.InstrumentSample]: XsbugInstrumentSampleMessage;
  [XsbugMessageType.Instrument]: XsbugInstrumentMessage;
};

export enum DeviceConnectionEventTypes {
  ConnectionError = 'ConnectionError'
}

export type ConnectionErrorMessage = ConnectionEvent<
  DeviceConnectionEventTypes.ConnectionError,
  Error
>;

export type DeviceConnectionEvents = {
  [DeviceConnectionEventTypes.ConnectionError]: ConnectionErrorMessage;
} & DeviceDebuggerEvents;

export class DeviceConnection extends Emittery.Typed<DeviceConnectionEvents> {
  protected parser: DOMParser;
  protected requestID: number;
  protected pending: PendingRequest[];

  constructor() {
    super();
    this.requestID = 1;
    this.pending = [];
    this.parser = new DOMParser();
  }

  doClearBreakpoint(path: string, line: number) {
    this.sendCommand(`<clear-breakpoint path="${path}" line="${line}"/>`);
  }
  doGo() {
    this.sendCommand('<go/>');
  }
  doSetBreakpoint(path: string, line: number) {
    this.sendCommand(`<set-breakpoint path="${path}" line="${line}"/>`);
  }
  doSelect(value) {
    this.sendCommand(`<select id="${value}"/>`);
  }
  doSetAllBreakpoints(
    breakpoints: DebugBreakpoint[] = [],
    exceptions = true,
    start = false
  ) {
    const breakpointLines = breakpoints.map(
      b => `<breakpoint path="${b.path}" line="${b.line}"/>`
    );
    if (exceptions) {
      breakpointLines.unshift('<breakpoint path="exceptions" line="0"/>');
    }
    if (start) {
      breakpointLines.unshift('<breakpoint path="start" line="0"/>');
    }
    this.sendCommand(
      `<set-all-breakpoints>${breakpointLines.join('')}</set-all-breakpoints>`
    );
  }
  doStep() {
    this.sendCommand('<step/>');
  }
  doStepInside() {
    this.sendCommand('<step-inside/>');
  }
  doStepOutside() {
    this.sendCommand('<step-outside/>');
  }
  doToggle(value) {
    this.sendCommand(`<toggle id="${value}"/>`);
  }

  private sendCommand(msg: String) {
    this.send(crlf + msg + crlf);
  }

  // Device Controll
  doGetPreference(domain: string, key: string, callback: ReplyCallback) {
    const byteLength = domain.length + 1 + key.length + 1;
    const payload = new Uint8Array(byteLength);
    let j = 0;
    for (let i = 0; i < domain.length; i++) payload[j++] = domain.charCodeAt(i);
    j++;
    for (let i = 0; i < key.length; i++) payload[j++] = key.charCodeAt(i);

    this.sendBinaryCommand(6, payload, callback);
  }

  async doInstall(data: Uint8Array) {
    const deferred = createDeferred<number>();
    let offset = 0;
    let sendOne = max => {
      const use = Math.min(max, data.byteLength - offset);
      const payload = new Uint8Array(4 + use);
      payload[0] = (offset >> 24) & 0xff;
      payload[1] = (offset >> 16) & 0xff;
      payload[2] = (offset >> 8) & 0xff;
      payload[3] = offset & 0xff;
      payload.set(data.slice(offset, offset + use), 4);
      this.sendBinaryCommand(3, payload, function(code) {
        offset += max;
        if (offset >= data.byteLength) {
          deferred.resolve(code);
          return;
        }
        sendOne(1024);
      });
    };
    sendOne(16);
    return deferred.promise;
  }
  doRestart() {
    this.sendBinaryCommand(1);
  }
  doSetPreference(domain: String, key: String, value: String) {
    // assumes 7 bit ASCII values
    const byteLength = domain.length + 1 + key.length + 1 + value.length + 1;
    const payload = new Uint8Array(byteLength);
    let j = 0;
    for (let i = 0; i < domain.length; i++) payload[j++] = domain.charCodeAt(i);
    j++;
    for (let i = 0; i < key.length; i++) payload[j++] = key.charCodeAt(i);
    j++;
    for (let i = 0; i < value.length; i++) payload[j++] = value.charCodeAt(i);

    this.sendBinaryCommand(4, payload);
  }
  doUninstall(callback: ReplyCallback) {
    this.sendBinaryCommand(2, undefined, callback);
  }

  sendBinaryCommand(
    command: number,
    payload?: Uint8Array | ArrayBuffer,
    callback?: ReplyCallback
  ) {
    if (payload) {
      if (!(payload instanceof ArrayBuffer)) payload = payload.buffer;
    }
    let needed = 1;
    if (payload) needed += 2 + payload.byteLength;
    else if (callback) needed += 2;
    const msg = new Uint8Array(needed);
    msg[0] = command;
    if (callback) {
      msg[1] = this.requestID >> 8;
      msg[2] = this.requestID & 0xff;
      this.pending.push({ callback, id: this.requestID++ });
    }
    if (payload) msg.set(new Uint8Array(payload), 3);
    this.send(msg.buffer);
  }

  public onReceive(raw: string | ArrayBuffer): void {
    if (raw instanceof ArrayBuffer) {
      this.handleControlMessage(raw);
    } else if ('string' === typeof raw) {
      this.handleDebuggingMessage(raw);
    }
  }

  // Debugging functions
  handleDebuggingMessage(raw: string) {
    const msg = XsbugMessageParser(
      this.parser.parseFromString(raw, 'application/xml')
    );
    msg.forEach(message => {
      switch (message.type) {
        case XsbugMessageType.Login:
          this.emit(XsbugMessageType.Login, message as XsbugLoginMessage);
          break;
        case XsbugMessageType.Log:
          this.emit(XsbugMessageType.Log, message as XsbugLogMessage);
          break;
        case XsbugMessageType.Break:
          this.emit(XsbugMessageType.Break, message as XsbugBreakMessage);
          break;
        case XsbugMessageType.Frames:
          this.emit(XsbugMessageType.Frames, message as XsbugFramesMessage);
          break;
        case XsbugMessageType.Local:
          this.emit(XsbugMessageType.Local, message as XsbugLocalMessage);
          break;
        case XsbugMessageType.Global:
          this.emit(XsbugMessageType.Global, message as XsbugGlobalMessage);
          break;
        case XsbugMessageType.Grammer:
          this.emit(XsbugMessageType.Grammer, message as XsbugGrammerMessage);
          break;
        case XsbugMessageType.Instrument:
          this.emit(
            XsbugMessageType.Instrument,
            message as XsbugInstrumentMessage
          );
          break;
        case XsbugMessageType.InstrumentSample:
          this.emit(
            XsbugMessageType.InstrumentSample,
            message as XsbugInstrumentSampleMessage
          );
          break;
        default:
          break;
      }
    });
  }

  private handleControlMessage(raw: ArrayBuffer) {
    const view = new DataView(raw);
    switch (view.getUint8(0)) {
      case 5:
        const id = view.getUint16(1),
          code = view.getInt16(3);
        const index = this.pending.findIndex(pending => id === pending.id);
        if (index >= 0) {
          const pending = this.pending[index];
          this.pending.splice(index, 1);
          pending.callback(code, raw.slice(5));
        }
        break;
      default:
        break;
    }
  }

  public connect() {}
  public async disconnect() {}
  protected send(data: string | ArrayBuffer) {}
}

export class DeviceConnectionWebSocket extends DeviceConnection {
  private socket: WebSocket;
  private uri: string;
  private connectionAttempt: number;

  private retryTimer: NodeJS.Timeout;
  private deferredConnect: Deferred<DeviceConnection>;

  constructor(uri: string) {
    super();
    this.uri = uri;
    this.connectionAttempt = 0;
    this.deferredConnect = createDeferred();
    this.once(XsbugMessageType.Login).then(() =>
      this.deferredConnect.resolve(this)
    );
  }

  // Websocket Connection.
  public connect() {
    if (this.socket && this.socket.OPEN) {
      return this.deferredConnect.promise;
    }
    this.tryToConnect();
    return this.deferredConnect.promise;
  }

  private tryToConnect() {
    if (this.socket) {
      this.socket.onopen = undefined;
      this.socket.onerror = undefined;
      this.socket.onmessage = undefined;
    }
    try {
      this.connectionAttempt++;
      this.socket = new WebSocket(this.uri, ['x-xsbug']);
      this.socket.binaryType = 'arraybuffer';
      this.socket.onopen = this._onOpen.bind(this);
      this.socket.onerror = this._onError.bind(this);
      this.socket.onclose = this._onClose.bind(this);
      this.socket.onmessage = this._onMessage.bind(this);
    } catch (e) {}
  }

  public async disconnect() {
    clearTimeout(this.retryTimer);
    if (this.socket) {
      this.connectionAttempt = 0;
      this.socket.close();
    }
  }

  private _onOpen(e: Event) {
    clearTimeout(this.retryTimer);
  }

  private _onError(e: Event) {
    if (this.connectionAttempt <= 10) {
      clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(() => {
        this.tryToConnect();
      }, 1000);
    } else {
      this.deferredConnect.reject(new Error('Connection error'));
      this.emit(DeviceConnectionEventTypes.ConnectionError, {
        type: DeviceConnectionEventTypes.ConnectionError,
        value: new Error('Connection error')
      });
    }
  }

  private _onMessage(e: MessageEvent) {
    this.onReceive(e.data);
  }

  private _onClose(e: Event) {}

  public async send(data: string | ArrayBuffer) {
    this.socket.send(data);
  }
}

const filters = [{ vendorId: 0x10c4, productId: 0xea60 }];

const DTR = Object.freeze({
  CLEAR: 0,
  SET: 1,
  MASK: 1 << 8
});
const RTS = Object.freeze({
  CLEAR: 0,
  SET: 2,
  MASK: 2 << 8
});
type DeviceUsbOptions = {
  baud?: number;
};

export class DeviceConnectionUsb extends DeviceConnection {
  private readonly decoder: TextDecoder;
  private readonly encoder: TextEncoder;
  private readonly baud: number;
  private dst: Uint8Array;

  private usb: USBDevice;
  private inEndpoint: number;
  private outEndpoint: number;

  private binary: boolean;
  private binaryLength: number;
  private dstIndex: number;
  private currentMachine: any;

  private deviceReady: Deferred<DeviceConnectionUsb>;

  constructor(options: DeviceUsbOptions = {}) {
    super();
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.baud = options.baud || 921600;
    this.dst = new Uint8Array(32 << 10);

    this.on(XsbugMessageType.Login, () => {
      this.deviceReady.resolve(this);
    });
  }
  async connect() {
    this.binary = false;
    this.dstIndex = 0;
    this.currentMachine = undefined;

    this.deviceReady = createDeferred<DeviceConnectionUsb>();

    await this.getDevice();
    await this.openDevice();

    this.readLoop();

    return this.deviceReady.promise;
  }
  async getDevice() {
    const devices = await navigator.usb.getDevices();
    if (devices.length > 0) {
      const usb = devices[0];
      this.usb = usb;
      let endpoints =
        usb.configurations[0].interfaces[0].alternates[0].endpoints;
      let inEndpoint, outEndpoint;
      for (let i = 0; i < endpoints.length; i++) {
        if ('out' === endpoints[i].direction)
          outEndpoint = endpoints[i].endpointNumber;
        if ('in' === endpoints[i].direction)
          inEndpoint = endpoints[i].endpointNumber;
      }
      if (undefined === inEndpoint || undefined === outEndpoint)
        throw new Error("can't find endpoints");
      this.inEndpoint = inEndpoint;
      this.outEndpoint = outEndpoint;
      return usb;
    }
    this.usb = await navigator.usb.requestDevice({ filters });
    return this.usb;
  }
  async openDevice() {
    await this.usb.open();
    await this.usb.selectConfiguration(1);
    await this.usb.claimInterface(0);
    await this.usb.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: 0,
      index: 0,
      value: 1
    });
    await this.usb.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: 7,
      index: 0,
      value: DTR.MASK | RTS.MASK | RTS.SET | DTR.CLEAR
    });
    await this.usb.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: 1,
      index: 0,
      value: 3686400 / this.baud
    });
    await this.usb.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: 18,
      index: 0,
      value: 15 // transmit & receive
    });
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.usb.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: 7,
      index: 0,
      value: DTR.MASK | DTR.SET
    });
  }
  async readLoop() {
    try {
      const byteLength = 8192;
      const results = [
        this.usb.transferIn(this.inEndpoint, byteLength),
        this.usb.transferIn(this.inEndpoint, byteLength),
        this.usb.transferIn(this.inEndpoint, byteLength)
      ];
      let phase = 0;
      while (true) {
        const result = await results[phase];
        results[phase] = this.usb.transferIn(this.inEndpoint, byteLength);
        phase = (phase + 1) % results.length;
        this.usbReceive(new Uint8Array(result.data.buffer));
      }
    } catch (e) {
      this.emit(DeviceConnectionEventTypes.ConnectionError, {
        type: DeviceConnectionEventTypes.ConnectionError,
        value: e
      });
    }
  }
  async send(data: string | ArrayBuffer) {
    if ('string' == typeof data) {
      const preamble = `${crlf}<?xs.${this.currentMachine}?>${crlf}`;
      data = this.encoder.encode(preamble + data);
      await this.usb.transferOut(this.outEndpoint, data);
    } else {
      let preamble: any = `${crlf}<?xs#${this.currentMachine}?>`;
      preamble = this.encoder.encode(preamble);
      let payload = new Uint8Array(data);
      let buffer = new Uint8Array(preamble.length + 2 + payload.length);
      buffer.set(preamble, 0);
      buffer[preamble.length] = (payload.length >> 8) & 0xff;
      buffer[preamble.length + 1] = payload.length & 0xff;
      buffer.set(payload, preamble.length + 2);
      await this.usb.transferOut(this.outEndpoint, buffer.buffer);
    }
  }
  async disconnect() {
    if (this.usb) {
      await this.usb.close();
      delete this.usb;
    }
  }

  usbReceive(src) {
    const mxTagSize = 17;

    let dst = this.dst;
    let dstIndex = this.dstIndex;
    let srcIndex = 0,
      machine;

    while (srcIndex < src.length) {
      if (dstIndex === dst.length) {
        // grow buffer
        dst = new Uint8Array(dst.length + 32768);
        dst.set(this.dst);
        this.dst = dst;
      }
      dst[dstIndex++] = src[srcIndex++];

      if (this.binary) {
        if (dstIndex < 2) this.binaryLength = dst[0] << 8;
        else if (2 === dstIndex) this.binaryLength |= dst[1];
        if (2 + this.binaryLength === dstIndex) {
          this.onReceive(dst.slice(2, 2 + this.binaryLength).buffer);

          dstIndex = 0;
          this.binary = false;
          delete this.binaryLength;
        }
      } else if (
        dstIndex >= 2 &&
        dst[dstIndex - 2] == 13 &&
        dst[dstIndex - 1] == 10
      ) {
        if (
          dstIndex >= mxTagSize &&
          (machine = DeviceConnectionUsb.matchProcessingInstruction(
            dst.subarray(dstIndex - mxTagSize, dstIndex)
          ))
        ) {
          if (machine.flag) this.currentMachine = machine.value;
          else this.currentMachine = undefined;
          this.binary = machine.binary;
        } else if (
          dstIndex >= 10 &&
          dst[dstIndex - 10] == '<'.charCodeAt(0) &&
          dst[dstIndex - 9] == '/'.charCodeAt(0) &&
          dst[dstIndex - 8] == 'x'.charCodeAt(0) &&
          dst[dstIndex - 7] == 's'.charCodeAt(0) &&
          dst[dstIndex - 6] == 'b'.charCodeAt(0) &&
          dst[dstIndex - 5] == 'u'.charCodeAt(0) &&
          dst[dstIndex - 4] == 'g'.charCodeAt(0) &&
          dst[dstIndex - 3] == '>'.charCodeAt(0)
        ) {
          const message = this.decoder.decode(dst.subarray(0, dstIndex));
          this.onReceive(message);
        } else {
          dst[dstIndex - 2] = 0;
        }
        dstIndex = 0;
      }
    }

    this.dstIndex = dstIndex;
  }
  static matchProcessingInstruction(dst) {
    let flag,
      binary = false,
      value = 0;
    if (dst[0] != '<'.charCodeAt(0)) return;
    if (dst[1] != '?'.charCodeAt(0)) return;
    if (dst[2] != 'x'.charCodeAt(0)) return;
    if (dst[3] != 's'.charCodeAt(0)) return;
    let c = dst[4];
    if (c == '.'.charCodeAt(0)) flag = true;
    else if (c == '-'.charCodeAt(0)) flag = false;
    else if (c == '#'.charCodeAt(0)) {
      flag = true;
      binary = true;
    } else return;
    for (let i = 0; i < 8; i++) {
      c = dst[5 + i];
      if ('0'.charCodeAt(0) <= c && c <= '9'.charCodeAt(0))
        value = value * 16 + (c - '0'.charCodeAt(0));
      else if ('a'.charCodeAt(0) <= c && c <= 'f'.charCodeAt(0))
        value = value * 16 + (10 + c - 'a'.charCodeAt(0));
      else if ('A'.charCodeAt(0) <= c && c <= 'F'.charCodeAt(0))
        value = value * 16 + (10 + c - 'A'.charCodeAt(0));
      else return;
    }
    if (dst[13] != '?'.charCodeAt(0)) return;
    if (dst[14] != '>'.charCodeAt(0)) return;
    return { value: value.toString(16).padStart(8, '0'), flag, binary };
  }
}
