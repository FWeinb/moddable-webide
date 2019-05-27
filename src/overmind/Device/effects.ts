import {
  DeviceConnectionUsb,
  DeviceConnectionWebSocket,
  DeviceConnection
} from '../../xs/DeviceConnection';

export let connection: DeviceConnection = null;

export let debugListener: any;

export const closeConnection = async () => {
  await connection.disconnect();
  connection = null;
};

export const removeAllDebugListener = () => {
  if (connection === null) return;
  if (debugListener != null) {
    connection.offAny(debugListener);
  }
};
export const addDebugListener = listener => {
  if (connection === null) return;
  if (debugListener != null) {
    connection.offAny(debugListener);
  }
  debugListener = listener;
  connection.onAny(debugListener);
};

export const createWifiConnection = (host: string) => {
  return (connection = new DeviceConnectionWebSocket(host));
};

export const createUsbConnection = (baudRate: number) => {
  return (connection = new DeviceConnectionUsb({
    baud: baudRate
  }));
};
