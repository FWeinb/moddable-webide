/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';

type BarGraphProps = {
  series: number[];
  onHover: (index: number) => void;
  height: number;
  width: string;
  barWidth: number;
};

const BarGraph: React.FC<BarGraphProps> = ({
  series,
  onHover,
  height,
  width,
  barWidth
}) => {
  let max = Math.max.apply(Math.max, series) * 1.5;
  if (!max) {
    max = height;
  }
  const [hoverIndex, setHoverIndex] = React.useState();

  return (
    <div
      css={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--color-light)',
        height,
        width: width
      }}
    >
      <div
        css={{
          display: 'inline-flex',
          flexShrink: 0,
          alignItems: 'flex-end',
          position: 'absolute',
          height: '100%',
          right: 0
        }}
      >
        {series.map((value, index) => {
          const background =
            (hoverIndex && index === hoverIndex) || index === series.length - 1
              ? 'var(--color-accent)'
              : 'var(--color-text-muted)';

          return (
            <div
              onMouseEnter={() => {
                setHoverIndex(index), onHover(index);
              }}
              onMouseLeave={() => {
                setHoverIndex(null), onHover(null);
              }}
              key={index}
              css={{
                cursor: 'pointer',
                marginRight: 1,
                width: barWidth
              }}
              style={{
                background,
                height: height * (value / max)
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BarGraph;
