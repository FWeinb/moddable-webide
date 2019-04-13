/** @jsx jsx */
import { jsx } from '@emotion/core';
import Button, { ButtonProps } from '../Button';

import NewFolderIcon from '../Icons/NewFolderIcon';
import NewFileIcon from '../Icons/NewFileIcon';

export const NewFolderButton: React.FC<ButtonProps> = ({ onClick }) => (
  <Button
    title={'Add Folder'}
    css={{ padding: '0 .5em', color: 'var(--color-text)' }}
    onClick={onClick}
  >
    <NewFolderIcon />
  </Button>
);

export const NewFileButton: React.FC<ButtonProps> = ({ onClick }) => (
  <Button
    title={'Add Folder'}
    css={{ padding: '0 .5em', color: 'var(--color-text)' }}
    onClick={onClick}
  >
    <NewFileIcon />
  </Button>
);

export const DeleteButton: React.FC<ButtonProps> = ({ onClick }) => (
  <Button
    title={'Delete'}
    css={{
      padding: '0 .5em',
      transform: 'scale(1.2)',
      color: 'var(--color-text)'
    }}
    onClick={onClick}
  >
    ×
  </Button>
);
