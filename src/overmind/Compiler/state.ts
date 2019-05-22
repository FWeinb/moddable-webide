export enum CompilerState {
  LOADING = 'LOADING',
  READY = 'READY',
  BUSY = 'BUSY'
}
export type Compiler = {
  state: CompilerState;
};

const state: Compiler = {
  state: CompilerState.LOADING
};

export default state;
