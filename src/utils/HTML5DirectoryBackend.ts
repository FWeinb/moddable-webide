import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropManager } from 'dnd-core';
import { getFilesFromDragEvent } from 'html-dir-content';

export default (manager: DragDropManager<any>) => {
  const backend = HTML5Backend(manager);
  // @ts-ignore
  const orgTopDropCapture = backend.handleTopDropCapture;

  // @ts-ignore
  backend.handleTopDropCapture = e => {
    orgTopDropCapture.call(backend, e);
    // @ts-ignore
    if (backend.currentNativeSource) {
      // @ts-ignore
      backend.currentNativeSource.item.dirContent = getFilesFromDragEvent(e, {
        recursive: true
      });
    }
  };

  return backend;
};
