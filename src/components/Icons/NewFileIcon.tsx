/** @jsx jsx */
import { jsx } from '@emotion/core';

const NewFileIcon = () => {
  return (
    <div
      css={{
        width: 28,
        height: 22,
        background: `rgba(0, 0, 0, 0) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath fill='%23C5C5C5' d='M12 3H8v1h3v3h3v7H6V8H5v7h10V6z'/%3E%3Cpath fill='%2389D185' d='M7 3.018H5V1H3.019v2.018H1V5h2.019v2H5V5h2V3.018z'/%3E%3C/svg%3E") no-repeat scroll 50% 50% / 16px padding-box border-box`
      }}
    />
  );
};

export default NewFileIcon;
