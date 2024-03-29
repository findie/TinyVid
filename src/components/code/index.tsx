import React from "react";
import {Box} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import color from 'color'
import * as css from './style.css'

export interface CodeDisplayProps {
  children?: React.ReactNode
  className?: string
  mono?: boolean
  wrap?: boolean,
  style?: React.CSSProperties
}

const styles = makeStyles(theme => ({
  'root': {
    background: color(theme.palette.background.paper).lighten(0.3).toString()
  },
  'niceText': {
    ...theme.typography.body1
  },
  'wrap': {
    whiteSpace: "pre-wrap"
  }
}))

export function CodeDisplay(props: CodeDisplayProps) {
  const classes = styles();

  return (
    <Box
      border={1}
      padding={1}
      className={(props.className || '') + ' ' + classes.root + ' ' + css.preContainer}
      style={props.style}
    >
      <pre className={css.pre + ' ' + (props.mono ?? true ? '' : classes.niceText) + (props.wrap ? classes.wrap : '')}>
        {props.children}
      </pre>
    </Box>
  )

}
