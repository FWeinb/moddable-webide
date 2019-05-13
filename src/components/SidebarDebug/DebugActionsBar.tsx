/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import Button from '../Button';
import {
  DebugRestartIcon,
  DebugBreakIcon,
  DebugGoIcon,
  DebugStepIcon,
  DebugStepIntoIcon,
  DebugStepOutIcon
} from '../Icons/DebugActionIcons';

import { useOvermind } from '../../overmind';

const DebugActionsBar: React.FC = () => {
  const {
    state: {
      Device: {
        debug: { activeBreak }
      }
    },
    actions: {
      Device: {
        debugRestart,
        debugGo,
        debugStep,
        debugStepInside,
        debugStepOutside
      }
    }
  } = useOvermind();

  const isActiveBreak = activeBreak !== null;

  return (
    <div
      css={{
        display: 'flex',
        flexShrink: 0,
        justifyContent: 'space-evenly',
        overflow: 'hidden',
        minWidth: 230,
        maxWidth: 250
      }}
    >
      <Button
        title={'Restart Device'}
        onClick={() => {
          debugRestart();
        }}
      >
        <DebugRestartIcon />
      </Button>
      <Button
        title={'Break'}
        disabled={isActiveBreak}
        onClick={() => {
          debugStep();
        }}
      >
        <DebugBreakIcon />
      </Button>
      <Button
        title={'Go'}
        disabled={!isActiveBreak}
        onClick={() => {
          debugGo();
        }}
      >
        <DebugGoIcon />
      </Button>
      <Button
        title={'Step'}
        disabled={!isActiveBreak}
        onClick={() => {
          debugStep();
        }}
      >
        <DebugStepIcon />
      </Button>
      <Button
        title={'Step Inside'}
        disabled={!isActiveBreak}
        onClick={() => {
          debugStepInside();
        }}
      >
        <DebugStepIntoIcon />
      </Button>
      <Button
        title={'Step Outside'}
        disabled={!isActiveBreak}
        onClick={() => {
          debugStepOutside();
        }}
      >
        <DebugStepOutIcon />
      </Button>
    </div>
  );
};

export default DebugActionsBar;
