/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';
import { DeviceInstrument } from '../../overmind/Device/state';

import SidebarPanel from '../SidebarPanel';
import BarGraph from './BarGraph';

// TODO: Might be better
// rewrite this to draw
// a canvas...

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
  // Adopt;
  useOvermind();
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

const InstrumentationPanel: React.FC = () => {
  const {
    state: {
      Device: {
        debug: { instruments, samples }
      }
    }
  } = useOvermind();
  return (
    <SidebarPanel title={'Instruments'}>
      <div
        css={{
          padding: '5px 11px'
        }}
      >
        {instruments && samples && (
          <InstrumentsGraphs instruments={instruments} samples={samples} />
        )}
      </div>
    </SidebarPanel>
  );
};

export default InstrumentationPanel;
