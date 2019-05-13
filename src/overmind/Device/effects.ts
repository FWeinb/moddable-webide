import { DeviceConnection } from '../../xs/DeviceConnection';

export let connection: DeviceConnection = null;

export const closeConnection = () => {
  connection.close();
  connection = null;
};

export const createConnection = (host: string) => {
  return (connection = new DeviceConnection(host));
};
