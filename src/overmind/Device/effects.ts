import {
  DeviceConnectionUsb,
  DeviceConnectionWebSocket,
  DeviceConnection
} from '../../xs/DeviceConnection';

export let connection: DeviceConnection = null;

export const closeConnection = async () => {
  await connection.disconnect();
  connection = null;
};

export const createWifiConnection = (host: string) => {
  return (connection = new DeviceConnectionWebSocket(host));
};

export const createUsbConnection = (baudRate: number) => {
  return (connection = new DeviceConnectionUsb({
    baud: baudRate
  }));
};
