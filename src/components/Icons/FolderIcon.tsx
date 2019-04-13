/** @jsx jsx */
import { jsx } from '@emotion/core';

export type DirIconProps = {
  open?: boolean;
};

const FolderIcon: React.FC<DirIconProps> = ({ open }) => {
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

export default FolderIcon;
