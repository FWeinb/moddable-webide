/** @jsx jsx */
import { jsx } from '@emotion/core';

export const DebugRestartIcon: React.FC = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
};
export const DebugGoIcon: React.FC = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
};

export const DebugBreakIcon: React.FC = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect fill="#fff" x="6" y="4" width="4" height="16" />
      <rect fill="#fff" x="14" y="4" width="4" height="16" />
    </svg>
  );
};

export const DebugStepIcon: React.FC = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" stroke="#fff">
      <polygon fill="#fff" points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
};

export const DebugStepIntoIcon: React.FC = () => {
  return <div>TODO</div>;
};

export const DebugStepOutIcon: React.FC = () => {
  return <div>TODO</div>;
};
