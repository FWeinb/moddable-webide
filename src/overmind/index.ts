import { Overmind, IConfig } from 'overmind';
import { namespaced, merge } from 'overmind/config';
import { createHook } from 'overmind-react';
import { onInitialize } from './onInitialize';

import * as effects from './effects';
import * as actions from './actions';
import state from './rootState';

import Device from './Device';
import Log from './Log';
import Compiler from './Compiler';
import Editor from './Editor';

const config = merge(
  { onInitialize, state, actions, effects },
  namespaced({
    Device,
    Log,
    Compiler,
    Editor
  })
);

declare module 'overmind' {
  interface Config extends IConfig<typeof config> {}
}

const overmind = new Overmind(config, { devtools: 'localhost:3031' });

export const useOvermind = createHook(overmind);
