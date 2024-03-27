// https://reactflow.dev/api-reference/types/node

const defaultFontSize = 10
const defaultNodeWidth = 150
const defaultNodeHeight = 100

const defaultNodeStyle = {
  boxSizing: 'border-box',
  borderWidth: '2px',
  background: 'white',
  borderRadius: '15px',
  fontSize: `${defaultFontSize}px`,
  minWidth: `${defaultNodeWidth}px`,
  minHeight: `${defaultNodeHeight}px`,
  width: '150px',
  height: '100px',
  display: 'flex',
  alignItems: 'flex-start',
  overflow: 'hidden'
}

export {
  defaultFontSize,
  defaultNodeHeight,
  defaultNodeStyle,
  defaultNodeWidth
}
