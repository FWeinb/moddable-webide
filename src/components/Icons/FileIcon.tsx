/** @jsx jsx */
import { jsx } from '@emotion/core';

const FileIcon = props => {
  return (
    <svg fill="none" height="28" width="28" {...props}>
      <path
        d="M15 7H6S4 7 4 9v15s0 2 2 2h11c2 0 2-2 2-2V13zm-2 2v5h4v10H6V9zm6-6h-9S8 3 8 5h8l4 5h1v12c2 0 2-2 2-2V9z"
        fill="#fff"
      />
    </svg>
  );
};

export default FileIcon;
