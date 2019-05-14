/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import React, {
  useState,
  useCallback,
  useEffect,
  PropsWithChildren,
  useRef
} from 'react';

import { __EXPERIMENTAL_DND_HOOKS_THAT_MAY_CHANGE_AND_BREAK_MY_BUILD__ as dnd } from 'react-dnd';
const { useDrop } = dnd;

import { NativeTypes } from 'react-dnd-html5-backend';

import { useOvermind } from '../../overmind';
import { XFile, Directory, XStorage } from '../../overmind/Storage/state';

import {
  FolderIcon,
  DefaultFileIcon,
  JsFileIcon
} from '../Icons/FileTreeIcons';
import { EditorFile } from '../../overmind/Editor/state';
import { isFilePartOf } from '../../overmind/Storage/utils';

import { NewFileButton, NewFolderButton, DeleteButton } from './Buttons';

const useFileDropzone = (parentDirId: string) => {
  const {
    actions: {
      Storage: { addDroppedFiles }
    }
  } = useOvermind();
  return useDrop({
    accept: [NativeTypes.FILE],
    drop(item, monitor) {
      // @ts-ignore
      item.dirContent.then(files => {
        addDroppedFiles({ parent: parentDirId, files });
      });
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true })
    })
  });
};

const useFocus = (domReference: React.RefObject<HTMLElement>) => {
  const [focused, setFocused] = useState(false);
  const onclick = useCallback(
    e => {
      if (domReference) {
        setFocused(domReference.current.contains(e.target));
      }
    },
    [domReference]
  );
  useEffect(() => {
    document.addEventListener('mousedown', onclick);
    return () => {
      document.removeEventListener('mousedown', onclick);
    };
  }, [domReference]);
  return focused;
};

type ItemConainerProps = {
  focused: boolean;
  selected: boolean;
  depth: number;
  children: ({ hover: boolean }) => React.ReactElement;
};

const ItemContainer: React.FC<ItemConainerProps> = ({
  focused,
  selected,
  depth,
  children
}) => {
  const [hover, setHover] = useState(false);

  const additionStyles = selected
    ? {
        color: focused ? 'var(--color-text)' : 'var(--color-text-muted)',
        background: focused ? 'var(--color-accent)' : 'var(--color-lightest)'
      }
    : hover
    ? {
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
        color: 'var(--color-text-muted)',
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
      <span>
        <FolderIcon open={open} />
      </span>
      <span
        css={{
          paddingLeft: '0.5em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {dir.name}
      </span>
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

const FileIcon: React.FC<{ filename: string }> = ({ filename }) => {
  const last = filename.lastIndexOf('.');
  if (last === -1) {
    return <DefaultFileIcon />;
  }
  const ext = filename.substr(last + 1);
  switch (ext) {
    case 'js':
      return <JsFileIcon />;
    default:
  }
  return <DefaultFileIcon />;
};
type FileItemProp = {
  file: XFile;
  hover: boolean;
};

const FileItem: React.FC<FileItemProp> = ({ file, hover }) => {
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
        cursor: 'pointer'
      }}
    >
      <span>
        <FileIcon filename={file.name} />
      </span>
      <span
        css={{
          paddingLeft: '0.5em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {file.name}
      </span>
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

const activeDragCss = css`
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
  focused: boolean;
  dir: Directory;
  depth: number;
  activeFile: EditorFile;
  parentDirId?: string;
  Storage: XStorage;
}>;

const DirectoryContainer: React.FC<DirectoryContainerProps> = ({
  focused,
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

  const [{ isOver }, dropRef] = useFileDropzone(parentDirId);

  return (
    <div
      ref={dropRef}
      css={[{ position: 'relative' }, isOver && activeDragCss]}
    >
      <ItemContainer focused={focused} depth={depth} selected={false}>
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
    </div>
  );
};

type DirectoryProps = {
  focused: boolean;
  parentDirId?: string;
  Storage: XStorage;
  activeFile: EditorFile;
  depth: number;
  style?: any;
};

const Dir: React.FC<DirectoryProps> = ({
  focused,
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
        .filter(dir => dir.parent === parentDirId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(dir => {
          return (
            <DirectoryContainer
              focused={focused}
              key={dir.id}
              depth={depth}
              Storage={Storage}
              parentDirId={dir.id}
              dir={dir}
              activeFile={activeFile}
            >
              <Dir
                focused={focused}
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
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(file => (
          <ItemContainer
            focused={focused}
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
      Storage: { createNewFile, createNewFolder },
      askRemoveProject
    }
  } = useOvermind();

  const domRef = useRef<HTMLElement>();
  const focused = useFocus(domRef);
  const [hover, setHover] = useState(false);

  const [{ isOver }, dropRef] = useFileDropzone(undefined);

  return (
    <section
      ref={domRef}
      css={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
    >
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
          background: 'var(--color-light2)'
        }}
      >
        <span
          css={{
            whiteSpace: 'nowrap'
          }}
        >
          {Storage.project ? Storage.project : 'Files'}
        </span>
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
          <DeleteButton
            onClick={e => (
              e.stopPropagation(), askRemoveProject(Storage.project)
            )}
          />
        </section>
      </header>
      <div ref={dropRef} css={[{ height: '100%' }, isOver && activeDragCss]}>
        <Dir
          focused={focused}
          activeFile={activeFile}
          Storage={Storage}
          depth={0}
        />
      </div>
    </section>
  );
};
export default FileTree;
