/** @jsx jsx */
import { jsx } from '@emotion/core';

type WebIDELogoProps = {
  color?: string;
} & React.SVGProps<SVGSVGElement>;

const WebIDELogo: React.FC<WebIDELogoProps> = ({
  color = '#fff',
  ...props
}) => {
  return (
    <svg viewBox="0 0 60 25" {...props}>
      <text fill={color} x="0" y="19" fontSize="16">
        WebIDE
      </text>
    </svg>
  );
};

export default WebIDELogo;
