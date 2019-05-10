import { EventEmitter } from 'betsy';
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
  Login,
  Frames,
  Local,
  Global,
  Grammer,
  Break,
  Log,
  InstrumentSample,
  Instrument
}

export type XsbugMessage = {
  type: XsbugMessageType;
};

export type XsbugLoginMessage = {
  name: string;
  value: string;
} & XsbugMessage;

export type XsbugFramesMessage = {
  frames: Array<XsbugFrame>;
} & XsbugMessage;

export type XsbugLocalMessage = {
  frame: XsbugFrame;
  properties: Array<XsbugProperty>;
} & XsbugMessage;

export type XsbugGlobalMessage = {
  properties: Array<XsbugProperty>;
} & XsbugMessage;

export type XsbugGrammerMessage = {
  properties: Array<XsbugProperty>;
} & XsbugMessage;

export type XsbugBreakMessage = {
  path: string;
  line: number;
  message: string;
} & XsbugMessage;

export type XsbugLogMessage = {
  log: string;
} & XsbugMessage;

export type XsbugInstrumentSampleMessage = {
  samples: Array<number>;
} & XsbugMessage;

export type XsbugInstrumentMessage = {
  instruments: Array<{ name: string; value: string }>;
} & XsbugMessage;

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
      name: node.attributes.name.value,
      value: node.attributes.value.value
    };
  },
  samples(node): XsbugInstrumentSampleMessage {
    return {
      type: XsbugMessageType.InstrumentSample,
      samples: node.textContent.split(',').map(value => parseInt(value))
    };
  },
  frames(node): XsbugFramesMessage {
    let frames = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
      frames.push(XsbugParseFrame(node));
    }
    return {
      type: XsbugMessageType.Frames,
      frames
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
      frame,
      properties
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
      properties: global
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
      properties: grammer
    };
  },
  break(node): XsbugBreakMessage {
    return {
      type: XsbugMessageType.Break,
      path: node.attributes.path.value,
      line: parseInt(node.attributes.line.value),
      message: node.textContent
    };
  },
  log(node): XsbugLogMessage {
    return {
      type: XsbugMessageType.Log,
      log: node.textContent
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
      instruments
    };
  }
};

const XsbugMessageParser = (xml: Document): Array<XsbugMessage> => {
  const root = xml.documentElement;
  if ('xsbug' !== root.nodeName) throw new Error('not xsbug xml');
  const messages = [];
  for (let node: Node = root.firstChild; node; node = node.nextSibling) {
    messages.push(XsbugTypeParser[node.nodeName](node));
  }
  return messages;
};

type ReplyCallback = (id: number, code: number, data: ArrayBuffer) => void;
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

export type MessageListener = (
  data: string | ArrayBufferLike | Blob | ArrayBufferView
) => void;

export class DeviceConnection {
  private socket: WebSocket;
  private uri: string;
  private connectionAttempt: number;

  private retryTimer: NodeJS.Timeout;
  private deferredConnect: Deferred<DeviceConnection>;
  private messageListener: Array<MessageListener>;

  constructor(uri: string) {
    this.uri = uri;
    this.messageListener = [];
    this.deferredConnect = createDeferred();
  }

  public connect() {
    if (this.socket && this.socket.OPEN) {
      return this.deferredConnect.promise;
    }
    this.tryToConnect();
    return this.deferredConnect.promise;
  }

  public close() {
    // TODO
  }

  public addOnDataListener(listener: MessageListener) {
    this.messageListener.push(listener);
  }

  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    this.socket.send(data);
  }

  private tryToConnect() {
    if (this.socket) {
      this.socket.onopen = undefined;
      this.socket.onerror = undefined;
      this.socket.onmessage = undefined;
    }
    this.socket = new WebSocket(this.uri, ['x-xsbug']);
    this.socket.binaryType = 'arraybuffer';
    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onerror = this._onError.bind(this);
    this.socket.onmessage = this._onMessage.bind(this);
    this.connectionAttempt++;
  }

  private _onOpen(e: Event): any {
    clearTimeout(this.retryTimer);
    this.deferredConnect.resolve(this);
  }
  private _onError(e: Event): any {
    if (this.connectionAttempt <= 10) {
      this.retryTimer = setTimeout(() => {
        this.tryToConnect();
      }, 1000);
    } else {
      this.deferredConnect.reject(e);
    }
  }

  private _onMessage(e: MessageEvent): any {
    this.messageListener.forEach(listener => listener(e.data));
  }
}

export class DeviceControl {
  private connection: DeviceConnection;
  private requestID: number;
  private pending: PendingRequest[];

  constructor(connection: DeviceConnection) {
    this.connection = connection;
    this.requestID = 1;
    this.pending = [];
    this.connection.addOnDataListener(this.onData.bind(this));
  }
  private onData(raw: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (raw instanceof ArrayBuffer) {
      const data = new DataView(raw);
      switch (data.getUint8(0)) {
        case 5:
          const id = data.getUint16(1),
            code = data.getInt16(3);
          const index = this.pending.findIndex(pending => id === pending.id);
          if (index >= 0) {
            const pending = this.pending[index];
            this.pending.splice(index, 1);
            pending.callback(id, code, raw.slice(5));
          }
          break;
        default:
          debugger;
          break;
      }
    }
  }

  doGetPreference(domain: string, key: string, callback: ReplyCallback) {
    const byteLength = domain.length + 1 + key.length + 1;
    const payload = new Uint8Array(byteLength);
    let j = 0;
    for (let i = 0; i < domain.length; i++) payload[j++] = domain.charCodeAt(i);
    j++;
    for (let i = 0; i < key.length; i++) payload[j++] = key.charCodeAt(i);

    this.sendBinaryCommand(6, payload, callback);
  }

  doInstall(offset: number, data: Uint8Array) {
    const max = 512;
    for (let i = 0; i < data.byteLength; i += max, offset += max) {
      const use = Math.min(max, data.byteLength - i);
      const payload = new Uint8Array(4 + use);
      payload[0] = (offset >> 24) & 0xff;
      payload[1] = (offset >> 16) & 0xff;
      payload[2] = (offset >> 8) & 0xff;
      payload[3] = offset & 0xff;
      payload.set(data.subarray(i, i + use), 4);

      this.sendBinaryCommand(3, payload);
    }
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
  private sendBinaryCommand(
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
    this.connection.send(msg.buffer);
  }
}

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

export class DeviceDebugger extends EventEmitter<DeviceDebuggerEvents> {
  private connection: DeviceConnection;
  private parser: DOMParser;

  constructor(connection: DeviceConnection) {
    super();
    this.connection = connection;
    this.parser = new DOMParser();
    this.connection.addOnDataListener(this.onData.bind(this));
  }
  private onData(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if ('string' === typeof data) {
      const msg = XsbugMessageParser(
        this.parser.parseFromString(data, 'application/xml')
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
  }

  doClearBreakpoint(path, line) {
    this.sendCommand(`<clear-breakpoint path="${path}" line="${line}"/>`);
  }
  doGo() {
    this.sendCommand('<go/>');
  }
  doSetBreakpoint(path, line) {
    this.sendCommand(`<set-breakpoint path="${path}" line="${line}"/>`);
  }
  doSelect(value) {
    this.sendCommand(`<select id="${value}"/>`);
  }
  doSetAllBreakpoints(breakpoints = [], exceptions = true, start = false) {
    breakpoints = breakpoints.map(
      b => `<breakpoint path="${b.path}" line="${b.line}"/>`
    );
    if (exceptions)
      breakpoints.unshift('<breakpoint path="exceptions" line="0"/>');
    if (start) breakpoints.unshift('<breakpoint path="start" line="0"/>');
    this.sendCommand(
      `<set-all-breakpoints>${breakpoints.join('')}</set-all-breakpoints>`
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
    this.connection.send(crlf + msg + crlf);
  }
}

/*
export default class DeviceConnection {
  private disconnected: boolean;

  private connectTimer: NodeJS.Timeout;
  private connectionAttempt: number;

  private uri: string;
  private socket: WebSocket;
  private parser: DOMParser;

  private requestID: number;
  private pending: PendingRequest[];

  private deferredConnection: Deferred<DeviceConnection>;

  constructor(uri: string) {
    this.uri = uri;
    this.parser = new DOMParser();
    this.connectionAttempt = 0;
    this.disconnected = false;
  }

  public connect() {
    this.initSocket();
    this.deferredConnection = createDeferred();
    return this.deferredConnection.promise;
  }

  public disconnect() {
    this.disconnected = true;
    clearTimeout(this.connectTimer);
    if (this.socket) {
      // Closing the socket will
      // hang the esp
      //this.socket.close();
    }
  }

  private initSocket() {
    this.requestID = 1;
    this.socket = new WebSocket(this.uri, ['x-xsbug']);
    this.socket.binaryType = 'arraybuffer';
    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onclose = this._onClose.bind(this);
    this.socket.onerror = this._onError.bind(this);
    this.socket.onmessage = this._onMessage.bind(this);
    this.connectionAttempt++;
  }

  private _onOpen(ev: Event) {
    if (this.disconnected) return;
    clearTimeout(this.connectTimer);
    this.onOpen(ev);
    this.deferredConnection.resolve(this);
    this.deferredConnection = null;
  }

  private _onError(err: Event) {
    if (this.disconnected) return;
    if (this.connectionAttempt <= 10) {
      this.connectTimer = setTimeout(() => {
        this.initSocket();
      }, 1000);
    } else {
      this.onConnectionError();
      this.deferredConnection.reject(err);
      this.deferredConnection = null;
    }
  }

  private _onClose(ev: CloseEvent) {
    if (this.disconnected) return;
    this.onClose(ev);
  }

  private _onMessage(event: MessageEvent) {
    if (this.disconnected) return;

    if ('string' === typeof event.data) {
      const msg = XsbugMessageParser(
        this.parser.parseFromString(event.data, 'application/xml')
      );
      msg.forEach(message => {
        switch (message.type) {
          case XsbugMessageType.Login:
            this.onLogin(message as XsbugLoginMessage);
            break;
          case XsbugMessageType.Log:
            this.onLog(message as XsbugLogMessage);
            break;
          case XsbugMessageType.Break:
            this.onBreak(message as XsbugBreakMessage);
            break;
          case XsbugMessageType.Frames:
            this.onFrames(message as XsbugFramesMessage);
            break;
          case XsbugMessageType.Local:
            this.onLocal(message as XsbugLocalMessage);
            break;
          case XsbugMessageType.Global:
            this.onGlobal(message as XsbugGlobalMessage);
            break;
          case XsbugMessageType.Grammer:
            this.onGrammer(message as XsbugGrammerMessage);
            break;
          case XsbugMessageType.Instrument:
            this.onInstrumentationConfigure(message as XsbugInstrumentMessage);
            break;
          case XsbugMessageType.InstrumentSample:
            this.onInstrumentationSamples(
              message as XsbugInstrumentSampleMessage
            );
            break;
          default:
            break;
        }
      });
    } else {
      const data = new DataView(event.data);
      switch (data.getUint8(0)) {
        case 5:
          const id = data.getUint16(1),
            code = data.getInt16(3);
          const index = this.pending.findIndex(pending => id === pending.id);
          if (index >= 0) {
            const pending = this.pending[index];
            this.pending.splice(index, 1);
            pending.callback(id, code, event.data.slice(5));
          }
          break;
        default:
          debugger;
          break;
      }
    }
  }

  // WebSocket Events
  onClose(ev: CloseEvent) {}
  onOpen(ev: Event) {}
  onError(ev: Event) {}
  onConnectionError() {}

  send(data) {
    return this.socket.send(data);
  }

  // Debugging actions
  doClearBreakpoint(path, line) {
    this.sendCommand(`<clear-breakpoint path="${path}" line="${line}"/>`);
  }
  doGo() {
    this.sendCommand('<go/>');
  }
  doSetBreakpoint(path, line) {
    this.sendCommand(`<set-breakpoint path="${path}" line="${line}"/>`);
  }
  doSelect(value) {
    this.sendCommand(`<select id="${value}"/>`);
  }
  doSetAllBreakpoints(breakpoints = [], exceptions = true, start = false) {
    breakpoints = breakpoints.map(
      b => `<breakpoint path="${b.path}" line="${b.line}"/>`
    );
    if (exceptions)
      breakpoints.unshift('<breakpoint path="exceptions" line="0"/>');
    if (start) breakpoints.unshift('<breakpoint path="start" line="0"/>');
    this.sendCommand(
      `<set-all-breakpoints>${breakpoints.join('')}</set-all-breakpoints>`
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

  // Debug Events
  onBreak(msg: XsbugBreakMessage) {}
  onLogin(msg: XsbugLoginMessage) {}
  onInstrumentationConfigure(msg: XsbugInstrumentMessage) {}
  onInstrumentationSamples(msg: XsbugInstrumentSampleMessage) {}
  onFrames(msg: XsbugFramesMessage) {}
  onLocal(msg: XsbugLocalMessage) {}
  onGlobal(msg: XsbugGlobalMessage) {}
  onGrammer(msg: XsbugGrammerMessage) {}
  onLog(msg: XsbugLogMessage) {}

  // Host actions
  doGetPreference(domain, key, callback) {
    const byteLength = domain.length + 1 + key.length + 1;
    const payload = new Uint8Array(byteLength);
    let j = 0;
    for (let i = 0; i < domain.length; i++) payload[j++] = domain.charCodeAt(i);
    j++;
    for (let i = 0; i < key.length; i++) payload[j++] = key.charCodeAt(i);

    this.sendBinaryCommand(6, payload, callback);
  }
  doInstall(offset: number, data: Uint8Array) {
    const max = 512;
    for (let i = 0; i < data.byteLength; i += max, offset += max) {
      const use = Math.min(max, data.byteLength - i);
      const payload = new Uint8Array(4 + use);
      payload[0] = (offset >> 24) & 0xff;
      payload[1] = (offset >> 16) & 0xff;
      payload[2] = (offset >> 8) & 0xff;
      payload[3] = offset & 0xff;
      payload.set(data.subarray(i, i + use), 4);

      this.sendBinaryCommand(3, payload);
    }
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

  // Helper
  sendCommand(msg: String) {
    this.send(crlf + msg + crlf);
  }

  sendBinaryCommand(
    command: number,
    payload: Uint8Array | ArrayBuffer = undefined,
    callback: ReplyCallback = undefined
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
}
*/
