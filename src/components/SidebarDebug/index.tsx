/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';

import { useOvermind } from '../../overmind';
import { ConnectionState, DeviceInstrument } from '../../overmind/Device/state';

import SidebarView from '../SidebarView';
import DebugActionsBar from './DebugActionsBar';

import DebugPropertiesPanel from './DebugPropertiesPanel';
import InstrumentationPanel from './InstrumentationPanel';
import SidebarPanel from '../SidebarPanel';

function getMessage(connectionState: ConnectionState) {
  switch (connectionState) {
    case ConnectionState.CONNECTING:
      return 'Currently connecting to the device.';
    case ConnectionState.ERROR:
      return 'Error connecting to the device, try resetting it';
  }
}

const SidebarDebug: React.FunctionComponent = () => {
  const {
    state: {
      Device: {
        connectionState,
        debug: {
          frames: { calls, local, global, grammer },
          activeBreak
        }
      }
    },
    actions: {
      Device: { debugToggleValue, debugSelectFrame }
    }
  } = useOvermind();

  const isActiveBreak = activeBreak !== null;

  return (
    <SidebarView title={'Debug'}>
      {connectionState === ConnectionState.CONNECTED ? (
        <React.Fragment>
          <DebugActionsBar />

          <div
            className="scrolling overlay"
            css={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
              overflowY: 'auto'
            }}
          >
            <InstrumentationPanel />
            {isActiveBreak && (
              <React.Fragment>
                {/*TODO: MOve this to an element for this*/}
                <SidebarPanel title={'Calls'} autoOpen={isActiveBreak}>
                  {calls &&
                    calls.map((call, i) => (
                      <div key={i + call.value[0] + call.name}>
                        <div
                          css={{
                            cursor: 'pointer',
                            ':hover': { background: 'rgba(255,255,255,0.3)' }
                          }}
                          onClick={
                            call.value[0] === '@' &&
                            (() => debugSelectFrame(call.value))
                          }
                        >
                          {call.name}
                        </div>
                      </div>
                    ))}
                </SidebarPanel>

                <DebugPropertiesPanel
                  title={'Local'}
                  properties={local && local.value.properties}
                  toggle={debugToggleValue}
                  autoOpen={isActiveBreak}
                />

                <DebugPropertiesPanel
                  title={'Global'}
                  properties={global && global.value.properties}
                  toggle={debugToggleValue}
                />
                <DebugPropertiesPanel
                  title={'Module'}
                  properties={grammer && grammer.value.properties}
                  toggle={debugToggleValue}
                />
              </React.Fragment>
            )}
          </div>
        </React.Fragment>
      ) : (
        <div
          css={{
            textAlign: 'center'
          }}
        >
          {getMessage(connectionState)}
        </div>
      )}
    </SidebarView>
  );
};

export default SidebarDebug;
