import {ThemeNames} from "../../helpers/theme";

import DarkIcon from '@material-ui/icons/Brightness2'
import LightIcon from '@material-ui/icons/Brightness5'
import AutoIcon from '@material-ui/icons/BrightnessAuto'

import {IconButton, Tooltip} from "@material-ui/core";
import React from "react";

interface ThemeSwitchProps {
  theme: ThemeNames,
  onClick: () => void
}

export const ThemeSwitch = React.memo(function ThemeSwitch({ onClick, theme }: ThemeSwitchProps) {

  let tooltip = 'System Theme (based on system preference)';
  let icon = <AutoIcon/>;
  if (theme === 'dark') {
    tooltip = 'Dark Theme'
    icon = <DarkIcon/>;
  }
  if (theme === 'light') {
    tooltip = 'Light Theme'
    icon = <LightIcon/>;
  }

  return (
    <Tooltip title={tooltip} arrow>
      <IconButton onClick={() => onClick()}>
        {icon}
      </IconButton>
    </Tooltip>
  );

});
