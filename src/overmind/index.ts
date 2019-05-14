import { createOvermind, IConfig } from 'overmind';
import { namespaced, merge } from 'overmind/config';
import { createHook } from 'overmind-react';
import { onInitialize } from './onInitialize';

import * as effects from './effects';
import * as actions from './actions';
import state from './rootState';

import Storage from './Storage';
import Device from './Device';
import Log from './Log';
import Compiler from './Compiler';
import Editor from './Editor';

const config = merge(
  { onInitialize, state, actions, effects },
  namespaced({
    Storage,
    Device,
    Log,
    Compiler,
    Editor
  })
);

declare module 'overmind' {
  interface Config extends IConfig<typeof config> {}
}

export const overmind = createOvermind(config);
export const useOvermind = createHook<typeof config>();
