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
        WebkitAppearance: 'button'
      }}
      style={{
        opacity: props.disabled ? 0.5 : 1,
        ...(props.style ? props.style : {})
      }}
    >
      {props.children}
    </button>
  );
};

export default Button;
