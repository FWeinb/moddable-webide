/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import Button, { ButtonProps } from '../Button';

type DimmedButtonProps = React.PropsWithChildren<
  {
    selected?: boolean;
  } & ButtonProps
>;

const ActivityBarButton: React.FC<DimmedButtonProps> = ({
  children,
  ...props
}) => {
  const opacity = props.selected ? 1 : props.disabled ? 0.3 : undefined;

  return (
    <Button
      css={{
        height: 50,
        opacity: 0.7,
        ':hover': {
          opacity: 1
        }
      }}
      style={{
        opacity
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ActivityBarButton;
