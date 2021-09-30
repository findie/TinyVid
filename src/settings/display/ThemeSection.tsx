import React from 'react'
import {observer} from "mobx-react";
import {Card, CardHeader, Radio, RadioGroup, ThemeProvider, Typography} from "@material-ui/core";
import {Theme, ThemeNames} from "../../helpers/theme";
import classes from './ThemeSection.module.scss';

export const ThemeSection = observer(function ThemeSection(){
  return (
    <>
      <Typography variant="h6">Theme</Typography>

      <RadioGroup
        value={Theme.currentName}
        onChange={(e, v) => {
          Theme.set(v as ThemeNames);
        }}
        className={classes.themeSelector}
      >

        <ThemeProvider theme={Theme.lightTheme}>
          <Card elevation={3}>
            <CardHeader
              title={
                <>
                  <Radio size="medium" color="primary" value="light"/>
                  Light Theme
                </>
              }
            />
          </Card>
        </ThemeProvider>

        <ThemeProvider theme={Theme.darkTheme}>
          <Card elevation={3}>
            <CardHeader
              title={
                <>
                  <Radio size="medium" color="primary" value="dark"/>
                  Dark Theme
                </>
              }
            />
          </Card>
        </ThemeProvider>

        <ThemeProvider theme={Theme.current}>
          <Card className={classes.systemTheme} elevation={3}>
            <CardHeader
              title={
                <>
                  <Radio size="medium" color="primary" value="system"/>
                  System Theme
                </>
              }
            />
            <div className={classes.flare}/>
          </Card>
        </ThemeProvider>

      </RadioGroup>
    </>
  )
})
