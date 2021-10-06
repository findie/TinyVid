import React, {useState} from 'react'
import {Checkbox, FormControlLabel, Paper, Tab, Tabs, Typography} from "@material-ui/core";
import {observer} from "mobx-react";
import classes from './Settings.module.scss';
import {TabContext, TabPanel} from "@material-ui/lab";
import {ThemeSection} from "./display/ThemeSection";
import {Encoders} from "./encoding/Encoders";
import {EncoderSettings} from "./encoding/encoder-settings/EncoderSettings";
import {RendererSettings} from "../helpers/settings";
import {action} from "mobx";

enum TabValues {
  customization = 'customization',
  encoding = 'encoding',
  advanced = 'advanced'
}

export const Settings = observer(function Settings() {
  const [selectedTab, setSelectedTab] = useState<TabValues>(TabValues.customization);

  return (
    <Paper className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={selectedTab}
        onChange={(e, v) => setSelectedTab(v)}
        className={classes.tabs}
        color="primary"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Display" value={TabValues.customization}/>
        <Tab label="Encoding" value={TabValues.encoding}/>
        <Tab label="Advanced" value={TabValues.advanced}/>

      </Tabs>


      <Paper className={classes.content}>
        <TabContext value={selectedTab}>
          <TabPanel value={TabValues.customization}>
            <header>
              <Typography variant="h4">Display</Typography>
            </header>

            <section>
              <ThemeSection/>
            </section>

          </TabPanel>
          <TabPanel value={TabValues.encoding}>
            <header>
              <Typography variant="h4">Encoding</Typography>
            </header>

            <section>
              <Encoders/>
            </section>

            <section>
              <Typography variant="h6">
                Encoder Settings
              </Typography>

              <EncoderSettings/>

            </section>
          </TabPanel>
          <TabPanel value={TabValues.advanced}>

            <header>
              <Typography variant="h4">Advanced</Typography>
            </header>

            <section>
              <FormControlLabel
                label="Enable Dev Tools - requires app restart to take effect"
                control={
                  <Checkbox
                    color="primary"
                    checked={RendererSettings.settings.flags.enableDevTools}
                    onChange={action((event, checked) => {
                      RendererSettings.settings.flags.enableDevTools = checked;
                    })}
                  />
                }
              />
              <FormControlLabel
                label="Disable NvEnc HEVC B-frames - Older GPUs don't support B-frames. you can disable them for compatibility"
                control={
                  <Checkbox
                    color="primary"
                    checked={RendererSettings.settings.flags.noHevcNvencBFrames}
                    onChange={action((event, checked) => {
                      RendererSettings.settings.flags.noHevcNvencBFrames = checked;
                    })}
                  />
                }
              />
            </section>
          </TabPanel>
        </TabContext>
      </Paper>

    </Paper>
  )
})
