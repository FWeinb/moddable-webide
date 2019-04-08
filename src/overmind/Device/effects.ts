import XsbugConnection from '../../xs/XsbugConnection';

export const connectDebugger = (url: string): XsbugConnection => {
  return new XsbugConnection(url);
};
