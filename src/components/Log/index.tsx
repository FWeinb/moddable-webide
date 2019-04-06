/** @jsx jsx */
import { jsx } from '@emotion/core';

import React, { useEffect, useRef } from 'react';
import { useOvermind } from '../../overmind';

const Log: React.FunctionComponent = () => {
  const {
    state: {
      log: { messages }
    }
  } = useOvermind();

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      console.log('OK');
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
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
          color: '#DAD9DA'
        }}
      >
        Log
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
          return <div key={message.time}> {message.text}</div>;
        })}
      </section>
    </section>
  );
};

export default Log;
