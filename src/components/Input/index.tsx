/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';

const Input: React.FunctionComponent<
  { css: any } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ css, ...props }) => {
  return (
    <input
      {...props}
      css={{
        ...css,
        border: '0',
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
