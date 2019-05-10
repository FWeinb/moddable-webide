/** @jsx jsx */
import { jsx } from '@emotion/core';

export const JsFileIcon = () => {
  return (
    <svg width="16" height="16" viewBox="-4 -6 30 30">
      <path
        fill="#f4bf75"
        d="M0 0h24v24H0V0zm22 18.3c-.1-1.1-.9-2-3-2.9-.7-.3-1.5-.6-1.8-1.1v-.7c.1-.7.9-.9 1.5-.7.4.1.8.4 1 .9l1.7-1.1-.6-.8c-.6-.7-1.4-1-2.8-1h-.7c-.7.2-1.3.6-1.7 1a3.1 3.1 0 0 0 .6 4.5c1.3 1 3.3 1.3 3.6 2.2.2 1.2-.9 1.6-2 1.4-.8-.1-1.2-.5-1.7-1.3l-1.9 1c.2.5.5.7.8 1.2 1.8 1.7 6.1 1.6 7-1 0-.1.2-.7 0-1.7zM13 11h-2.2v5.8l-.1 2.7c-.4.7-1.2.6-1.6.5a2 2 0 0 1-.8-.8L8 19 6.3 20c.3.6.8 1.2 1.3 1.5.9.5 2 .7 3.2.4.8-.2 1.5-.7 1.8-1.4.6-1 .5-2 .4-3.3V11z"
      />
    </svg>
  );
};

export const DefaultFileIcon = () => {
  return (
    <svg width="16" height="16" viewBox="-1 -1 32 32">
      <path
        d="M20.75,2H4.35V30h23.3V9Zm4.6,25.7H6.75V4.3h11.7v7h7V27.7Z"
        fill="#c5c5c5"
      />
    </svg>
  );
};

export type DirIconProps = {
  open?: boolean;
};

export const FolderIcon: React.FC<DirIconProps> = ({ open }) => {
  return open ? (
    <svg width="16" height="16">
      <path
        d="M14 2s1 0 1 1v9c0 1-1 1-1 1V3H8L7 5H3v3h8l3 5H3L1 8h1V5c0-1 1.2-1 1-1h3.5l1-2H14z"
        fill="#c5c5c5"
      />
    </svg>
  ) : (
    <svg width="16" height="16">
      <path
        d="M14.5 2H7L6 4H2.5c-.3 0-.5.2-.5.5v8c0 .3.2.5.5.5h12c.3 0 .5-.2.5-.5v-10c0-.3-.2-.5-.5-.5zM14 4H7.5L8 3h6v1z"
        fill="#c5c5c5"
      />
    </svg>
  );
};
