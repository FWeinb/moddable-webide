export enum CompilerState {
  LOADING,
  READY,
  BUSY
}
export type Compiler = {
  state: CompilerState;
  errors: string[];
};

const state: Compiler = {
  state: CompilerState.LOADING,
  errors: undefined
};

export default state;
