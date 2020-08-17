import styled from "styled-components"

const BLUE = '#040035'
const GREEN = '#73FF9A'
const TRANSPARENT = 'transparent'
const WHITE = '#F2F2F2'
const BLACK = 'black'
const RED = '#FF004D'

const colors = {
  primaryDark: {
    background: BLUE,
    backgroundActive: BLUE,
    color: WHITE,
    colorActive: WHITE,
    border: TRANSPARENT,
    borderActive: TRANSPARENT
  },
  primaryLight: {
    background: GREEN,
    backgroundActive: GREEN,
    color: BLUE,
    colorActive: BLUE,
    border: TRANSPARENT,
    borderActive: TRANSPARENT
  },
  secondaryDark: {
    background: TRANSPARENT,
    backgroundActive: BLUE,
    color: BLUE,
    colorActive: WHITE,
    border: BLUE,
    borderActive: BLUE
  },
  secondaryLight: {
    background: TRANSPARENT,
    backgroundActive: WHITE,
    color: WHITE,
    colorActive: BLACK,
    border: WHITE,
    borderActive: WHITE
  },
  remove: {
    background: TRANSPARENT,
    backgroundActive: TRANSPARENT,
    color: RED,
    colorActive: RED,
    border: TRANSPARENT,
    borderActive: RED
  }
}

const ButtonWrapper = styled.div`
  border-radius: 6px;
  background-color: ${({ color }) => color.background};
  transition: all .2s;
  filter: none;
  color: ${({ color }) => color.color};
  box-shadow: 0 0 0 1.5px ${({ color }) => color.border} inset;
  display: flex;
  flex-flow: row nowrap;
  padding: 0 21px 0 15px;
  height: 36px;
  align-items: center;
  cursor: default;

  &:hover, &:active {
    background-color: ${({ color }) => color.backgroundActive};
    color: ${({ color }) => color.colorActive};
    box-shadow: 0 0 0 1.5px ${({ color }) => color.borderActive} inset;
    filter: saturate(180%);
  }

  & > span {
    margin-left: 12px;
    font-weight: 600;
    font-size: 15px;
    line-height: 18px;
    transition: color .2s;
    color: ${({ color }) => color.color};
  }

  &:active > span, &:hover > span {
    color: ${({ color }) => color.colorActive};
  }

  &:hover, &:active {
    background-color: ${({ color }) => color.backgroundActive};
    color: ${({ color }) => color.colorActive};
    box-shadow: 0 0 0 1.5px ${({ color }) => color.borderActive} inset;
  }
`

export const Button = ({ type, icon, name, ...props }) => {
  const color = colors[type]
  const Icon = icon
  return <ButtonWrapper color={color} {...props}>
    <Icon size={21} />
    <span>{name}</span>
  </ButtonWrapper>
}

const GroupWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;
  margin: 38px 0 0 0;

  ${({ theme: { isXS } }) => isXS && `
    align-items: flex-start;
  `}
`

Button.Group = ({ children }) => {
  return <GroupWrapper>
    {children.map ? children.map((i, idx) => <React.Fragment key={`GroupWrapper-${idx}`}>
      {i}
      {idx !== children.length && <div style={{ height: 12 }} />}
    </React.Fragment>) : children}
  </GroupWrapper>
}

export default Button
