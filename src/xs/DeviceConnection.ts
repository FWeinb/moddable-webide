const crlf = String.fromCharCode(13) + String.fromCharCode(10);

type XsbugProperty = {
  name: string;
  value: string;
  flags: {
    value: string;
    delete: boolean;
    enum: boolean;
    set: boolean;
  };
  property?: Array<XsbugProperty>;
};

type XsbugFrame = {
  name: string;
  value: string;
  path?: string;
  line?: number;
};

enum XsbugMessageType {
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

type XsbugMessage = {
  type: XsbugMessageType;
};

type XsbugLoginMessage = {
  name: string;
  value: string;
} & XsbugMessage;

type XsbugFramesMessage = {
  frames: Array<XsbugFrame>;
} & XsbugMessage;

type XsbugLocalMessage = {
  frame: XsbugFrame;
  properties: Array<XsbugProperty>;
} & XsbugMessage;

type XsbugGlobalMessage = {
  global: Array<XsbugProperty>;
} & XsbugMessage;

type XsbugGrammerMessage = {
  grammer: Array<XsbugProperty>;
} & XsbugMessage;

type XsbugBreakMessage = {
  path: string;
  line: number;
  message: string;
} & XsbugMessage;

type XsbugLogMessage = {
  log: string;
} & XsbugMessage;

type XsbugInstrumentSampleMessage = {
  samples: Array<number>;
} & XsbugMessage;

type XsbugInstrumentMessage = {
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
    value: node.attributes.value && node.attributes.value.value,
    flags: {
      value: flags,
      delete: flags.indexOf('C') < 0,
      enum: flags.indexOf('E') < 0,
      set: flags.indexOf('W') < 0
    }
  };

  if (node.firstChild) {
    property.property = [];
    for (let p = node.firstChild; p; p = p.nextSibling)
      property.property.push(XsbugParseProperty(p));
    property.property.sort((a, b) => a.name.localeCompare(b.name));
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
      global
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
      grammer
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

export default class DeviceConnection {
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
  }

  public connect() {
    this.disconnect();
    this.initSocket();
    this.deferredConnection = createDeferred();
    return this.deferredConnection.promise;
  }

  public disconnect() {
    clearTimeout(this.connectTimer);
    if (this.socket) {
      this.socket.close();
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
    clearTimeout(this.connectTimer);
    this.onOpen(ev);
    this.deferredConnection.resolve(this);
    this.deferredConnection = null;
  }

  private _onError(err: Event) {
    if (this.socket.readyState === 3) {
      if (this.connectionAttempt <= 10) {
        this.connectTimer = setTimeout(() => {
          this.initSocket();
        }, 1000);
      } else {
        this.onConnectionError();
        this.deferredConnection.reject(err);
        this.deferredConnection = null;
      }
    } else {
      this.onError(err);
    }
  }

  private _onClose(ev: CloseEvent) {
    this.onClose(ev);
  }

  private _onMessage(event: MessageEvent) {
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
          case XsbugMessageType.Local:
            this.onLocal(message as XsbugLocalMessage);
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
  onLocal(msg: XsbugLocalMessage) {}
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
