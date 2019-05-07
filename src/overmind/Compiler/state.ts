export enum CompilerState {
  LOADING,
  READY,
  BUSY
}
export type Compiler = {
  state: CompilerState;
};

const state: Compiler = {
  state: CompilerState.LOADING
};

export default state;
