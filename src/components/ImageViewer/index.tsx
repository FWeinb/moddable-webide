/** @jsx jsx */
import { jsx } from '@emotion/core';

import React, { useRef, useEffect } from 'react';
import { XFile } from '../../overmind/Storage/state';

export type ImageViewerProps = {
  file: XFile;
};
const ImageViewer: React.FC<ImageViewerProps> = ({ file }) => {
  const imgRef = useRef<HTMLImageElement>();
  useEffect(() => {
    if (!imgRef.current) return;

    const urlObject = URL.createObjectURL(new Blob([file.content]));

    imgRef.current.src = urlObject;

    return () => {
      URL.revokeObjectURL(urlObject);
    };
  }, [file, imgRef]);
  return (
    <div
      css={{
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'scroll',
        backgroundPosition: '0 0,8px 8px',
        backgroundSize: '16px 16px',
        backgroundImage:
          'linear-gradient(45deg,#141414 25%,transparent 0,transparent 75%,#141414 0,#141414),linear-gradient(45deg,#141414 25%,transparent 0,transparent 75%,#141414 0,#141414)'
      }}
    >
      <img ref={imgRef} />
    </div>
  );
};

export default ImageViewer;
