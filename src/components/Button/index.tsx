/** @jsx jsx */
import { jsx, InterpolationWithTheme } from '@emotion/core';
import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = props => {
  return (
    <button
      {...props}
      css={{
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        outline: 'none',
        '-webkit-appearance': 'button'
      }}
    >
      {props.children}
    </button>
  );
};

export default Button;
