import XsbugConnection from '../../xs/XsbugConnection';

export enum LogType {
  INFO,
  WARNING,
  ERROR
}

export type Message = {
  type: LogType;
  time: number;
  text: string;
};

export type Log = {
  messages: Message[];
};

const state: Log = {
  messages: []
};

export default state;
