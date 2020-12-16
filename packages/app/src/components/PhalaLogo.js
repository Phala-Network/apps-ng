import * as React from "react"

function PhalaLogo ({ size = 36, fill = '#fff',  ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 500 500" fill="none" {...props}>
      <defs>
        <style>{`.prefix__cls-1{fill:${fill}}`}</style>
      </defs>
      <path
        className="prefix__cls-1"
        d="M194.15 250h137.71v45.91H194.15zM331.86 181.14h45.91V250h-45.91zM194.15 295.91h-45.92v68.86h45.91v-45.9h.01v-22.96zM331.86 135.23H148.23V250h45.92v-68.86h137.71v-45.91z"
      />
      <path className="prefix__cls-1" d="M194.15 250h137.71v45.91H194.15z" />
    </svg>
  )
}

export default PhalaLogo
