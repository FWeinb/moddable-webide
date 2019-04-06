/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';

const Input: React.FunctionComponent<
  React.InputHTMLAttributes<HTMLInputElement>
> = props => {
  return (
    <input
      {...props}
      css={{
        border: '0',
        height: '2.5em',
        padding: '0 5px',
        backgroundColor: 'var(--color-lightest)',
        color: 'var(--color-text-muted)',
        caretColor: 'var(--color-text-muted)',
        '::placeholder': {
          color: 'var(--color-text-muted)'
        },
        ':focus': {
          outline: '1px solid var(--color-accent)',
          outlineOffset: -1
        }
      }}
    />
  );
};

export default Input;
