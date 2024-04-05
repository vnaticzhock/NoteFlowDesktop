// https://reactflow.dev/api-reference/types/node

const defaultFontSize = 10
const defaultNodeWidth = 250
const defaultNodeHeight = 300

const defaultNodeStyle = {
  boxSizing: 'border-box',
  borderWidth: '2px',
  background: 'white',
  borderRadius: '15px',
  fontSize: `${defaultFontSize}px`,
  minWidth: `${defaultNodeWidth}px`,
  minHeight: `${defaultNodeHeight}px`,
  width: 'fit-content',
  height: 'fit-content',
  display: 'flex',
  alignItems: 'flex-start'
}

export {
  defaultFontSize,
  defaultNodeHeight,
  defaultNodeStyle,
  defaultNodeWidth
}
