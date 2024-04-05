import React, { SVGProps } from 'react'
import './Loading.scss'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
  color?: string
}

const LoadingDotsIcon = ({
  size = 1,
  color = 'currentColor',
  ...otherProps
}: IconProps): React.JSX.Element => {
  const dotStyle = {
    transformOrigin: '50% 50%',
    animation: 'bouncedelay 1s infinite ease-in-out both',
    fill: color
  }

  const animationDelays = {
    dot1: '-0.54s',
    dot2: '-0.48s',
    dot3: '-0.32s'
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}rem`}
      height={`${size * (12 / 44)}rem`}
      viewBox="0 0 44 12"
      {...otherProps}>
      <circle
        style={{ ...dotStyle, animationDelay: animationDelays.dot1 }}
        cx="6"
        cy="6"
        r="6"
      />
      <circle
        style={{ ...dotStyle, animationDelay: animationDelays.dot2 }}
        cx="22"
        cy="6"
        r="6"
      />
      <circle
        style={{ ...dotStyle, animationDelay: animationDelays.dot3 }}
        cx="38"
        cy="6"
        r="6"
      />
    </svg>
  )
}

export default LoadingDotsIcon
