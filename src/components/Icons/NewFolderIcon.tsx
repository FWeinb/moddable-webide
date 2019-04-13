/** @jsx jsx */
import { jsx } from '@emotion/core';

const NewFolderIcon = props => {
  return (
    <svg {...props} width="16" height="16">
      <path
        fill="#C5C5C5"
        d="M14 4H9.6l-1 2H6v2H3v6h12V4h-1zm0 2h-3.9l.5-1H14v1z"
      />
      <path fill="#89D185" d="M7 3H5V1H3v2H1v2h2v2h2V5h2z" />
    </svg>
  );
};

export default NewFolderIcon;
