/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import SidebarPanel from '../SidebarPanel';
import { EditorBreakpoint } from '../../overmind/Editor/state';
import { useOvermind } from '../../overmind';

export type BreakpointPanelProps = {
  breakpoints: EditorBreakpoint[];
  toggleBreakpoint: (breakpoint: EditorBreakpoint) => void;
  getFileName: (fileId: string) => string;
};

const BreakpointPanel: React.FC<BreakpointPanelProps> = ({
  breakpoints,
  toggleBreakpoint,
  getFileName
}) => {
  // Adopt Tracking
  useOvermind();

  return (
    <SidebarPanel title={'Breakpoints'} autoOpen={true}>
      {breakpoints
        .map(breakpoint => ({
          fileName: getFileName(breakpoint.fileId),
          ...breakpoint
        }))
        .sort((a, b) => a.line - b.line)
        .sort((a, b) => a.fileName.localeCompare(b.fileName))
        .map(breakpoint => {
          return (
            <div
              key={breakpoint.fileId + breakpoint.line}
              css={[
                {
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0 1em',
                  cursor: 'pointer'
                },
                breakpoint.disabled && {
                  '::before': {
                    content: "''",
                    position: 'absolute',
                    top: 'calc(50% - 0.5px)',
                    left: '.5em',
                    right: '.5em',
                    height: 1,
                    background: 'white'
                  }
                }
              ]}
              onClick={e => {
                e.preventDefault();
                toggleBreakpoint(breakpoint);
              }}
            >
              <span>{breakpoint.fileName}</span>
              <span>{breakpoint.line}</span>
            </div>
          );
        })}
    </SidebarPanel>
  );
};

export default BreakpointPanel;
