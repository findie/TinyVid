import React, {useState} from 'react'
import {observer} from "mobx-react";
import {
  Button,
  Collapse,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  Paper,
  Tooltip,
  Typography
} from "@material-ui/core";
import classes from './Queue.module.scss';
import {QueueItemClass, QueueStore} from "../global-stores/QueueStore";
import {ProcessStore} from "../global-stores/Process.store";
import classNames from "classnames";
import {AppState} from "../global-stores/AppState.store";
import {ConfigVideoSettings} from "../config/video-settings";
import {ProcessContextProvider} from "../global-stores/contexts/Process.context";
import {VideoStrategy} from "../config/Strategy";
import VideoLibrary from "@material-ui/icons/VideoLibrary";
import Videocam from "@material-ui/icons/Videocam";
import Stop from "@material-ui/icons/Stop";
import {TruncatedFilePath} from "../components/truncated-file-path/TruncatedFilePath";
import Edit from "@material-ui/icons/Edit";
import {makeStyles} from "@material-ui/core/styles";
import Link from "@material-ui/icons/Link";
import LinkOff from "@material-ui/icons/LinkOff";
import SettingsApplications from "@material-ui/icons/SettingsApplications";
import Clear from "@material-ui/icons/Clear";
import {WarningRounded} from "@material-ui/icons";
import PlayArrow from "@material-ui/icons/PlayArrow";

const qItemsThemedClassesStyles = makeStyles(theme => ({
  'textField': {
    background: theme.palette.background.default
  }
}));

export const QueueItemComponent = observer(function QueueItemComponent({ item }: { item: QueueItemClass }) {

  const themedClasses = qItemsThemedClassesStyles();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className={classNames(classes.itemSection, classes.file, themedClasses.textField)}>
        <Typography>Input: </Typography>
        <TruncatedFilePath filePath={item.fileIn}/>

        <Tooltip title="Remove from queue">
          <IconButton
            size="small"
            onClick={() => QueueStore.remove(item)}
          >
            <Clear/>
          </IconButton>
        </Tooltip>
      </div>
      <div className={classNames(classes.itemSection, classes.file, themedClasses.textField)}>
        <Typography>Output: </Typography>
        <TruncatedFilePath filePath={item.fileOut}/>

        {item.fileOutAlreadyExists && (
          <Tooltip title="Looks like the file already exists. It will be replaced!">
            <WarningRounded
              fontSize="small"
              color="inherit"
              style={{ color: 'orange' }}
            />
          </Tooltip>
        )}

        {!item.isDone && (
          <Tooltip title="Change output location">
            <IconButton
              size="small"
              onClick={item.requestOutputChange}
            >
              <Edit/>
            </IconButton>
          </Tooltip>
        )}
        {item.isDone && (
          <Tooltip title="Play output">
            <IconButton
              size="small"
              onClick={item.requestOutputPlayback}
            >
              <PlayArrow/>
            </IconButton>
          </Tooltip>
        )}
      </div>

      <div className={classNames(classes.itemSection, classes.progress)}>
        <LinearProgress
          className={classes.progressBar}
          variant="determinate"
          value={
            (
              item.isDone ?
                1 :
                item.process?.progress?.progress ?? 0
            ) * 100
          }
        />
        <Typography className={classes.progressInfo}>
          {item.statusText}
        </Typography>

        <Tooltip title="Change item's settings">
          <IconButton onClick={() => setShowSettings(b => !b)}>
            <SettingsApplications/>
          </IconButton>
        </Tooltip>
      </div>

      <Collapse
        in={showSettings}
        className={classes.itemSection}
        classes={{
          wrapperInner: classNames(classes.itemSection, classes.settings)
        }}
      >
        <ProcessContextProvider store={item}>
          <div style={{ display: 'flex', marginRight: 'auto' }}>
            <Tooltip title={
              item.isStrategyLocked ?
                'Unlink and edit' :
                'Link to global settings'
            }>
              <IconButton
                className={classes.linkIcon}
                onClick={item.toggleStrategyLock}
                disabled={item.isDone}
              >
                {
                  item.isStrategyLocked ?
                    <Link/> :
                    <LinkOff/>
                }
              </IconButton>
            </Tooltip>

            <VideoStrategy disabled={item.isStrategyLocked || item.isDone}/>
          </div>

          <ConfigVideoSettings disabled={item.isVideoSettingsLocked || item.isDone} canUpscale/>
          <Tooltip title={
            item.isVideoSettingsLocked ?
              'Unlink and edit' :
              'Link to global settings'
          }>
            <IconButton
              className={classes.linkIcon}
              onClick={item.toggleVideoSettingsLock}
              disabled={item.isDone}
            >
              {
                item.isVideoSettingsLocked ?
                  <Link/> :
                  <LinkOff/>
              }
            </IconButton>
          </Tooltip>
        </ProcessContextProvider>
      </Collapse>

    </>
  )
})

export const QueueComponent = observer(function QueueComponent() {

  return (
    <Paper
      elevation={0}
      className={classes.root}
    >

      <div className={classes.controls}>
        <div className={classes.buttons}>
          <Button
            onClick={AppState.requestFileInputDialogFlow}
            color="primary"
            variant="contained"
            startIcon={<VideoLibrary/>}
            disabled={QueueStore.isRunning}
          >
            Add
          </Button>
          <Button
            // disabled
            variant="contained"
            color="secondary"
            startIcon={<Videocam/>}
            disabled={QueueStore.isRunning}
            onClick={QueueStore.start}
          >
            Start
          </Button>
          <Button
            // disabled
            variant="contained"
            startIcon={<Stop/>}
            color={!QueueStore.isRunning ? 'default' : 'inherit'}
            style={!QueueStore.isRunning ? undefined : { background: 'orangered', color: 'white' }}
            disabled={!QueueStore.isRunning}
            onClick={QueueStore.stop}
          >
            Stop
          </Button>
        </div>

        <div className={classes.tuning}>
          <ProcessContextProvider store={ProcessStore}>
            <div className={classes.left}>
              <VideoStrategy/>
            </div>
            <ConfigVideoSettings/>
          </ProcessContextProvider>
        </div>
      </div>

      <List className={classes.list}>
        {QueueStore.queue.map((x, i) => {
          return (
            <ListItem
              key={i}
              className={classNames(
                classes.listItem,
                QueueStore.isRunning && classes.disabled
              )}
            >
              <QueueItemComponent item={x}/>
            </ListItem>
          )
        })}

        {QueueStore.queue.length === 0 && (
          <Typography variant="h6" className={classes.empty}>Queue is empty</Typography>
        )}
      </List>


    </Paper>
  );

});


export const CollapsableQueue = observer(function CollapsableQueue() {
  return (
    <div
      className={classNames(
        classes.collapse,
        AppState.showQueue && classes.show,
        !AppState.showQueue && classes.hide,
      )}
    >
      <div className={classes.collapseHandle}>
        <Tooltip arrow
          title={AppState.showQueue && QueueStore.isRunning ?
            'You cannot hide the queue while it is running' :
            AppState.showQueue ?
              'Hide the queue panel' :
              'Show the queue panel'
          }
        >
          <Paper
            className={classNames(
              classes.collapseHandleItem,
              QueueStore.isRunning && classes.disabled
            )}
            onClick={() => {
              if (QueueStore.isRunning) {
                AppState.setShowQueue(true);
              } else {
                AppState.setShowQueue(!AppState.showQueue);
              }
            }}
          >
            <Typography>
              {AppState.showQueue ? 'Hide Queue' : 'Show Queue'}
            </Typography>
          </Paper>
        </Tooltip>
      </div>
      <QueueComponent/>
    </div>
  )
});
