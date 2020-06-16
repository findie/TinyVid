import React from "react";
import {Box} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../../helpers/theme";
import color from 'color'
import * as css from './style.css'

export interface CodeDisplayProps {
  children?: React.ReactNode
  className?: string
}

const styles = () => makeStyles({
  'root': {
    background: color(Theme.current().palette.background.paper).lighten(0.3).toString()
  }
})

export function CodeDisplay(props: CodeDisplayProps) {
  const classes = styles()();

  return (
    <Box border={1} padding={1} className={(props.className || '') + ' ' + classes.root + ' ' + css.preContainer}>
      <pre className={css.pre}>
        {props.children}
      </pre>
    </Box>
  )

}