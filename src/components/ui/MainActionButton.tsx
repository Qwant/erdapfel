import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import { capitalizeFirst } from 'src/libs/string';
import { Flex } from '@qwant/qwant-ponents';
import { ReactComponent as IconLeaf } from '../../../public/images/leaf.svg';

type MainActionButtonProps = {
  variant?: string;
  label?: string;
  onClick?: React.HTMLProps<HTMLButtonElement>['onClick'];
  icon?: string | JSX.Element;
  iconStyle?: CSSProperties;
  className?: string;
  ecoResponsible?: string;
};

const MainActionButton = ({
  variant,
  label,
  onClick,
  icon,
  iconStyle,
  className,
  ecoResponsible,
  ...rest
}: MainActionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classnames(
        'mainActionButton',
        {
          [`mainActionButton--${variant}`]: variant,
        },
        className
      )}
      {...rest}
    >
      {typeof icon === 'string' ? (
        <div className={`mainActionButton-icon icon-${icon}`} style={iconStyle}>
          {ecoResponsible && (
            <span className="ecoResponsible-leaf">
              <span className="ecoResponsible-leaf-inner">
                <IconLeaf className="ecoResponsible-icon" />
              </span>
            </span>
          )}
        </div>
      ) : (
        <Flex className="mainActionButton-icon" center>
          {icon}
        </Flex>
      )}
      <div className="mainActionButton-label u-ellipsis">{capitalizeFirst(label)}</div>
    </button>
  );
};

export default MainActionButton;
