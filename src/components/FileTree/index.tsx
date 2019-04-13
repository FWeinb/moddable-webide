/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import React, {
  useState,
  useCallback,
  useEffect,
  PropsWithChildren
} from 'react';
import { useDropzone } from 'react-dropzone';

import { useOvermind } from '../../overmind';
import { XFile, Directory, XStorage } from '../../overmind/Storage/state';

import Button from '../Button';
import FolderIcon from '../Icons/FolderIcon';
import JsFileIcon from '../Icons/JsFileIcon';
import { EditorFile } from '../../overmind/Editor/state';
import { isFilePartOf } from '../../overmind/Storage/utils';

import { NewFileButton, NewFolderButton, DeleteButton } from './Buttons';

type ItemConainerProps = {
  selected: boolean;
  depth: number;
  children: ({ hover: boolean }) => React.ReactElement;
};

const ItemContainer: React.FC<ItemConainerProps> = ({
  selected,
  depth,
  children
}) => {
  const [hover, setHover] = useState(false);

  const additionStyles = selected
    ? {
        color: 'var(--color-text)',
        background: 'var(--color-light)'
      }
    : {};

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      css={{
        height: 22
      }}
      style={{
        ...additionStyles,
        padding: `.125em 0 .125em ${0.75 + depth * 0.7}em`
      }}
    >
      {children({ hover })}
    </div>
  );
};

type DirItemProp = {
  dir: Directory;
  parentId: string;

  onClick: () => void;
  open: boolean;
  hover: boolean;
};

const DirItem: React.FC<DirItemProp> = ({
  onClick,
  parentId,
  open,
  dir,
  hover
}) => {
  const {
    actions: {
      Storage: { createNewFile, createNewFolder, removeDir }
    }
  } = useOvermind();
  return (
    <div
      onClick={onClick}
      css={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        color: 'var(--color-text-muted)'
      }}
    >
      <FolderIcon open={open} />
      <span css={{ paddingLeft: '0.5em' }}>{dir.name}</span>
      <section
        css={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: 'auto',
          fontWeight: 'bold'
        }}
        style={{ visibility: hover ? 'visible' : 'hidden' }}
      >
        <NewFileButton
          onClick={e => (e.stopPropagation(), createNewFile(parentId))}
        />
        <NewFolderButton
          onClick={e => (e.stopPropagation(), createNewFolder(parentId))}
        />
        <DeleteButton onClick={e => (e.stopPropagation(), removeDir(dir.id))} />
      </section>
    </div>
  );
};

type FileItemProp = {
  file: XFile;
  hover: boolean;
};

const FileItem: React.FunctionComponent<FileItemProp> = ({ file, hover }) => {
  const {
    actions: {
      Editor: { openFile },
      Storage: { removeFile }
    }
  } = useOvermind();
  return (
    <div
      onClick={() => openFile(file.id)}
      css={{
        display: 'flex',
        cursor: 'pointer',
        color: 'var(--color-text-muted)'
      }}
    >
      <span>
        <JsFileIcon />
      </span>
      <span css={{ paddingLeft: '0.5em' }}>{file.name}</span>
      <section
        css={{ marginLeft: 'auto', fontWeight: 'bold' }}
        style={{ visibility: hover ? 'visible' : 'hidden' }}
      >
        <DeleteButton
          onClick={e => (e.stopPropagation(), removeFile(file.id))}
        />
      </section>
    </div>
  );
};

const activeDrag = css`
  ::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
  }
`;

type DirectoryContainerProps = PropsWithChildren<{
  dir: Directory;
  depth: number;
  activeFile: EditorFile;
  parentDirId?: string;
  Storage: XStorage;
}>;

const DirectoryContainer: React.FC<DirectoryContainerProps> = ({
  dir,
  depth,
  parentDirId,
  Storage,
  activeFile,
  children
}) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (activeFile) {
      if (isFilePartOf(Storage, parentDirId, activeFile.id)) {
        setOpen(true);
      }
    }
  }, [activeFile]);
  return (
    <React.Fragment>
      <ItemContainer depth={depth} selected={false}>
        {({ hover }) => (
          <DirItem
            parentId={dir.id}
            dir={dir}
            open={open}
            hover={hover}
            onClick={() => setOpen(prev => !prev)}
          />
        )}
      </ItemContainer>
      {open && children}
    </React.Fragment>
  );
};

type DirectoryProps = {
  parentDirId?: string;
  Storage: XStorage;
  activeFile: EditorFile;
  depth: number;
  style?: any;
};

const Dir: React.FC<DirectoryProps> = ({
  parentDirId,
  Storage,
  activeFile,
  depth,
  style,
  ...props
}) => {
  return (
    <div
      css={[
        {
          position: 'relative',
          flexGrow: 1,
          margin: 0,
          padding: 0,
          listStyle: 'none'
        }
      ]}
      style={style}
      {...props}
    >
      {Object.values(Storage.directories)
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter(dir => dir.parent === parentDirId)
        .map(dir => {
          return (
            <DirectoryContainer
              key={dir.id}
              depth={depth}
              Storage={Storage}
              parentDirId={dir.id}
              dir={dir}
              activeFile={activeFile}
            >
              <Dir
                Storage={Storage}
                activeFile={activeFile}
                parentDirId={dir.id}
                style={{ display: open ? 'block' : 'none' }}
                depth={depth + 1}
              />
            </DirectoryContainer>
          );
        })}
      {Object.values(Storage.files)
        .filter(file => file.parent === parentDirId)
        .map(file => (
          <ItemContainer
            key={file.id}
            depth={depth}
            selected={activeFile && activeFile.id === file.id}
          >
            {({ hover }) => <FileItem hover={hover} file={file} />}
          </ItemContainer>
        ))}
    </div>
  );
};

const FileTree: React.FunctionComponent = () => {
  const {
    state: {
      Storage,
      Editor: { activeFile }
    },
    actions: {
      Storage: { addDroppedFiles, createNewFile, createNewFolder }
    }
  } = useOvermind();

  const [hover, setHover] = useState(false);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    addDroppedFiles(acceptedFiles);
  }, []);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: ['.js', '.json'],
    noKeyboard: true,
    noDragEventsBubbling: true
  });

  return (
    <section css={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <header
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        css={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          paddingLeft: '1em',
          textTransform: 'uppercase',
          fontSize: 11,
          height: 22,
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          background: 'var(--color-light2)'
        }}
      >
        <span>Files</span>
        <section
          css={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto',
            fontWeight: 'bold'
          }}
          style={{ visibility: hover ? 'visible' : 'hidden' }}
        >
          <NewFileButton
            onClick={e => (e.stopPropagation(), createNewFile(undefined))}
          />
          <NewFolderButton
            onClick={e => (e.stopPropagation(), createNewFolder(undefined))}
          />
        </section>
      </header>
      <div
        css={[{ height: '100%' }, isDragActive && activeDrag]}
        {...getRootProps()}
      >
        <Dir activeFile={activeFile} Storage={Storage} depth={0} />
      </div>
    </section>
  );
};

export default FileTree;
