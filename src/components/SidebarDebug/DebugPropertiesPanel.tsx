/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';

import SidebarPanel from '../SidebarPanel';
import { XsbugProperty } from '../../xs/DeviceConnection';

const sortingRegexps = [
  /(\[)([0-9]+)(\])/,
  /(\(\.)([0-9]+)(\))/,
  /(\(\.\.)([0-9]+)(\))/,
  /(arg\()([0-9]+)(\))/,
  /(var\()([0-9]+)(\))/
];
const sortingZeros = '0000000000';

type ToggleFunction = (value: string) => void;

export type DebugPropertyProps = {
  property: XsbugProperty;
  toggle: ToggleFunction;
};
const DebugProperty: React.FC<DebugPropertyProps> = ({ property, toggle }) => {
  const { name, value, properties } = property;
  const isValue = value && value[0] !== '@';
  const onClick = isValue ? undefined : () => toggle(value);

  return (
    <div
      onClick={onClick}
      css={{
        display: 'flex',
        flexShrink: 0,
        cursor: 'pointer',
        ':hover': {
          color: 'var(--color-text-muted)',
          background: 'rgba(255,255,255,0.3)'
        }
      }}
      style={{ cursor: isValue ? 'not-allowed' : 'pointer' }}
    >
      <span css={{ display: 'inline-block', width: 5 }}>
        {!isValue ? (properties === undefined ? '+' : '-') : ''}
      </span>
      <span
        css={{
          paddingLeft: '0.5em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        <span>{name}</span>
        <span css={{ color: 'var(--color-text-muted)' }}>
          {isValue ? ' = ' + value : ''}
        </span>
      </span>
    </div>
  );
};

export type DebugFramePropertiesProps = {
  properties: XsbugProperty[];
  toggle: ToggleFunction;
  depth?: number;
};

const DebugFrameProperties: React.FC<DebugFramePropertiesProps> = ({
  properties,
  toggle,
  depth = 0
}) =>
  properties ? (
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
    >
      {properties
        .map(({ name, flags, value, properties }) => {
          for (let i = 0; i < sortingRegexps.length; i++) {
            let results = sortingRegexps[i].exec(name);
            if (results) {
              let result = results[2];
              name =
                results[1] +
                sortingZeros.slice(0, -result.length) +
                result +
                results[3];
              break;
            }
          }
          return { name, flags, value, properties };
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(property => {
          const properties = property.properties;
          return (
            <div
              key={property.name}
              css={{
                margin: 0,
                padding: `.125em 0 .125em`
              }}
              style={{
                paddingLeft: `${0.5 + depth * 0.2}em`
              }}
            >
              <DebugProperty property={property} toggle={toggle} />
              {properties && (
                <DebugFrameProperties
                  properties={properties}
                  toggle={toggle}
                  depth={++depth}
                />
              )}
            </div>
          );
        })}
    </div>
  ) : (
    <div />
  );

export type DebugPropertiesPanel = {
  title: string;
  properties: XsbugProperty[];
  toggle: ToggleFunction;
  autoOpen?: boolean;
};

const DebugPropertiesPanel: React.FC<DebugPropertiesPanel> = ({
  title,
  properties,
  toggle,
  autoOpen
}) => {
  return (
    <SidebarPanel title={title} autoOpen={autoOpen}>
      <DebugFrameProperties properties={properties} toggle={toggle} />
    </SidebarPanel>
  );
};

export default DebugPropertiesPanel;
