/** @jsx jsx */
import { jsx } from '@emotion/core';

import React, { useEffect, useRef } from 'react';
import { useOvermind } from '../../overmind';
import { LogType } from '../../overmind/Log/state';

const getLogColor = (type: LogType) => {
  switch (type) {
    case LogType.ERROR:
      return 'var(--color-error)';
    case LogType.INFO:
      return 'var(--color-text)';
    case LogType.WARNING:
      return 'var(--color-warning)';
  }
};

const Log: React.FunctionComponent = () => {
  const {
    state: {
      Log: { messages }
    }
  } = useOvermind();

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const node = scrollContainerRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages.length]);

  return (
    <section
      css={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--color-darkest)'
      }}
    >
      <header
        css={{
          padding: '0.5em',
          color: 'var(--color-text)',
          boxShadow: '0 1px 0 var(--color-light), 0 2px 0 rgba(0,0,0,.3)'
        }}
      >
        <span>Log</span>
      </header>
      <section
        css={{
          padding: '.5em',
          color: 'white',
          fontSize: '12px',
          lineHeight: '16px',
          overflow: 'scroll'
        }}
        ref={scrollContainerRef}
        className="scrolling"
      >
        {messages.map(message => {
          const color = getLogColor(message.type);
          return (
            <div key={message.time} style={{ color }}>
              {message.text}
            </div>
          );
        })}
      </section>
    </section>
  );
};

export default Log;
