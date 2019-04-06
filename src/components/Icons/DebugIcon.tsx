/** @jsx jsx */
import { jsx } from '@emotion/core';

export type DebugIconProps = {
  indicatorColor?: string;
} & React.SVGProps<SVGSVGElement>;

const DebugIcon: React.FC<DebugIconProps> = ({
  indicatorColor = null,
  ...props
}) => {
  return (
    <svg width="28" height="28" fill="none" {...props}>
      <g clipPath="url(#a)">
        <path
          d="M15.2 18v5c0 .6 0 1.5-.5 1.5h-1.9v-1.2H14v-3.7l-.2-.2a4.1 4.1 0 0 1-5.4.1C7 18.2 7 16.3 8.6 14h-4v1.2H3.6v-2c0-.5 1-.4 1.5-.4h4.8l5.4 5.3zM11.7 5.9h-1.2V4.7h2.3c.5 0 1.2.2 1.2.8v3.9l.9 1a2.3 2.3 0 0 1 2.2-2 1 1 0 0 1 .4 0V5.8h1.2v3a.7.7 0 0 0 .4.5h3v1.2h-2.5v.3a2.3 2.3 0 0 1-2 2.3l1 .9h4c.5 0 .7.7.7 1.2v2.3h-1.1v-1.2h-3L11.7 9V5.8zM14 0a14 14 0 1 0 0 28 14 14 0 0 0 0-28zm11.7 14a11.6 11.6 0 0 1-2.7 7.4L6.6 5a11.7 11.7 0 0 1 19 9zM2.3 14c0-2.7 1-5.3 2.7-7.4L21.4 23a11.7 11.7 0 0 1-19-9z"
          fill="#fff"
        />
        {indicatorColor && (
          <circle cx="22" cy="22" r="6" fill={indicatorColor} />
        )}
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h28v28H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default DebugIcon;
