import React, {useState} from 'react'
import {Paper, Tab, Tabs, Typography} from "@material-ui/core";
import {observer} from "mobx-react";
import classes from './Settings.module.scss';
import {TabContext, TabPanel} from "@material-ui/lab";
import {ThemeSection} from "./display/ThemeSection";
import {Encoders} from "./encoding/Encoders";

enum TabValues {
  customization = 'customization',
  encoding = 'encoding',
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
          </TabPanel>
        </TabContext>
      </Paper>

    </Paper>
  )
})
