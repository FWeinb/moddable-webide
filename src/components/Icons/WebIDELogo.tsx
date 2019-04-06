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
    <svg viewBox="0 0 230 105.2" {...props}>
      <path
        fill={color}
        stroke={color}
        strokeMiterlimit="10"
        d="M10.1 11.1c0-4.4 3.3-7.8 7-7.3l75.4 10.7c4.5.7 5.9 7.5 5.9 10.8l.3 4.8v-6.7c0-3.5-1.1-10.1-5.9-10.9L16.4 1c-1.8-.3-2.9.2-2.9.2L7.1 3.9C4.6 5 2.6 7.3 2.6 10.2v83.3a7 7 0 0 0 4.5 6.3l6.4 2.7s1.1.5 2.9.2l76.3-11.5c4.8-.8 5.9-7.4 5.9-10.9v-6.7l-.3 4.8c0 3.3-1.4 10.2-5.9 10.8L17.1 99.9c-3.7.5-7-2.9-7-7.3V11.1z"
      />
      <text fill={color} x="25" y="70" fontSize="55">
        WebIDE
      </text>
    </svg>
  );
};

export default WebIDELogo;
