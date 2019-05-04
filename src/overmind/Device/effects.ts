import DeviceConnection from '../../xs/DeviceConnection';

export const connect = (url: string): DeviceConnection => {
  return new DeviceConnection(url);
};
