/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';
import { ConnectionState, DeviceInstrument } from '../../overmind/Device/state';
import Button from '../Button';
import BarGraph from './BarGraph';

const AskToConnect: React.FC = () => {
  return <div>Currently Not Connected</div>;
};

function zip(a: any[], b: any[]) {
  var arr = [];
  for (var key in a) arr.push([a[key], b[key]]);
  return arr;
}

type InstrumentsGraphsProps = {
  instruments: DeviceInstrument[];
  samples: number[][];
};

const InstrumentsGraphs: React.FC<InstrumentsGraphsProps> = ({
  instruments,
  samples
}) => {
  return (
    <React.Fragment>
      {instruments.map(({ name, value, indices }) => {
        const [hoverIndex, setHoverIndex] = React.useState();

        const series = indices.map(index => samples[index]);
        let pickedValue;
        if (hoverIndex) {
          pickedValue = series.map(v => v[hoverIndex]);
        } else {
          pickedValue = series.map(last => last[last.length - 1]);
        }

        return (
          <div key={name} css={{ marginBottom: '.5em' }}>
            <header css={{ fontSize: 11 }}>
              <span>{name}</span>
              <span css={{ float: 'right' }}>{zip(pickedValue, value)}</span>
            </header>
            <BarGraph
              onHover={setHoverIndex}
              barWidth={2}
              height={20}
              width="100%"
              series={series[0]}
            />
          </div>
        );
      })}
    </React.Fragment>
  );
};

const InstrumentationView: React.FC = () => {
  const {
    state: {
      Device: {
        debug: { instruments, samples }
      }
    }
  } = useOvermind();
  return (
    <section
      css={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      <header
        css={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          paddingLeft: '1em',
          textTransform: 'uppercase',
          fontSize: 11,
          height: 22,
          fontWeight: 500,
          background: 'var(--color-light2)'
        }}
      >
        <span>Instruments</span>
      </header>
      <section
        className={'scrolling'}
        css={{
          padding: '5px 11px',
          overflow: 'auto'
        }}
      >
        {instruments && samples && (
          <InstrumentsGraphs instruments={instruments} samples={samples} />
        )}
      </section>
    </section>
  );
};

const SidebarDebug: React.FunctionComponent = () => {
  const {
    state: {
      Device: { connectionState }
    },
    actions: {
      Device: { debugBreak, debugContinue }
    }
  } = useOvermind();

  return (
    <section
      role="complementary"
      css={{
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        background: 'var(--color-dark)',
        height: '100%',
        fontSize: '0.9rem'
      }}
    >
      <header
        css={{
          display: 'flex',
          alignItems: 'center',
          height: 30,
          fontSize: '0.8em',
          padding: '0 10px',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)'
        }}
      >
        Debug
      </header>
      {connectionState === ConnectionState.CONNECTED ? (
        <React.Fragment>
          <div>
            <Button
              css={{ fontSize: '1.5em', color: 'lime' }}
              onClick={() => {
                debugContinue();
              }}
            >
              ▶
            </Button>
            <Button
              css={{ fontSize: '1.5em', color: 'gray' }}
              onClick={() => {
                debugBreak();
              }}
            >
              ❙❙
            </Button>
          </div>
          <InstrumentationView />
        </React.Fragment>
      ) : (
        <AskToConnect />
      )}
    </section>
  );
};

export default SidebarDebug;
