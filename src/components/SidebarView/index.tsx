/** @jsx jsx */
import { jsx } from '@emotion/core';

const SidebarView: React.FC<{
  title: string;
}> = ({ title, children }) => (
  <section
    role="complementary"
    css={{
      display: 'flex',
      flexShrink: 0,
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-dark)',
      fontSize: '0.9rem'
    }}
  >
    <header
      css={{
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        height: 30,
        fontSize: '0.8em',
        padding: '0 10px',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)'
      }}
    >
      {title}
    </header>
    {children}
  </section>
);

export default SidebarView;
