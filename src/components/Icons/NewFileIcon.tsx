/** @jsx jsx */
import { jsx } from '@emotion/core';

const NewFileIcon = props => {
  return (
    <svg {...props} width="16" height="16">
      <path fill="#C5C5C5" d="M12 3H8v1h3v3h3v7H6V8H5v7h10V6z" />
      <path fill="#89D185" d="M7 3H5V1H3v2H1v2h2v2h2V5h2V3z" />
    </svg>
  );
};

export default NewFileIcon;
