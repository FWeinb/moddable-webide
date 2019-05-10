/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect } from 'react';

const SidebarPanel: React.FC<{
  title: string;
  autoOpen?: boolean;
}> = ({ title, autoOpen, children }) => {
  let [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (!open && autoOpen === true) {
      setOpen(true);
    }
  }, [autoOpen]);

  return (
    <section
      css={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}
    >
      <header
        onClick={e => (e.preventDefault(), setOpen(!open))}
        css={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          flexShrink: 0,
          alignItems: 'center',
          paddingLeft: '1em',
          textTransform: 'uppercase',
          fontSize: 11,
          height: 22,
          fontWeight: 500,
          background: 'var(--color-light2)',
          cursor: 'pointer',
          borderBottom: '1px solid var(--color-dark)',
          ':hover': {
            background: 'var(--color-light1)'
          },
          ':active': {
            background: 'var(--color-light)'
          }
        }}
      >
        <span
          css={{
            display: 'inline-block',
            marginRight: '.25em',
            fontFamily: 'monospace'
          }}
        >
          {open ? '-' : '+'}
        </span>
        <span>{title}</span>
      </header>
      {open && children}
    </section>
  );
};

export default SidebarPanel;
