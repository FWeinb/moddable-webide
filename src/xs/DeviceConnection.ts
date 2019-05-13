import Emittery from 'emittery';

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

export type XsbugMessage<T> = {
  type: XsbugMessageType;
  value: T;
};

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

export type DebugBreakpoint = {
  path: string;
  line: number;
};

export class DeviceConnection extends Emittery.Typed<DeviceDebuggerEvents> {
  private socket: WebSocket;
  private uri: string;
  private connectionAttempt: number;

  private retryTimer: NodeJS.Timeout;
  private deferredConnect: Deferred<DeviceConnection>;

  private parser: DOMParser;

  private requestID: number;
  private pending: PendingRequest[];

  constructor(uri: string) {
    super();
    this.uri = uri;
    this.parser = new DOMParser();
    this.deferredConnect = createDeferred();
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
    this.socket = new WebSocket(this.uri, ['x-xsbug']);
    this.socket.binaryType = 'arraybuffer';
    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onerror = this._onError.bind(this);
    this.socket.onclose = this._onClose.bind(this);
    this.socket.onmessage = this._onMessage.bind(this);
    this.connectionAttempt++;
  }

  public close() {
    clearTimeout(this.retryTimer);
    if (this.socket) {
      this.socket.close();
    }
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
  private _onClose(e: Event): any {}

  public _onMessage(event: MessageEvent): void {
    const raw = event.data;
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
    this.socket.send(crlf + msg + crlf);
  }

  // Device Controll
  private handleControlMessage(raw: ArrayBuffer) {
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
    this.socket.send(msg.buffer);
  }
}
