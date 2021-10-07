import React from 'react'
import {observer} from "mobx-react";
import {
  Button, FormControl,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Typography
} from "@material-ui/core";
import {ControlPosition, DraggableBounds} from 'react-draggable';
import classes from './Queue.module.scss';
import {b2text, bps2text, seconds2time} from "../../helpers/math";
import {dialog, getCurrentWindow} from "@electron/remote";
import {eventList} from "../../helpers/events";
import {QueueItemClass, QueueStore} from "../../global-stores/QueueStore";
import {RendererFileHelpers} from "../../helpers/file";
import {ProcessStore} from "../../global-stores/Process.store";
import classNames from "classnames";
import {action} from "mobx";
import {AppState} from "../../global-stores/AppState.store";
import {ConfigMaxFileSize} from "../../config/max-file-size";
import {ConfigConstantQuality} from "../../config/constant-quality";
import {ConfigVideoSettings} from "../../config/video-settings";

const DRAG_AREA_POSITION: ControlPosition = { x: 0, y: 0 };
const DRAG_AREA_BOUNDS: DraggableBounds = { top: -100, bottom: 100 };


async function add2q() {
  const files = await dialog.showOpenDialog(
    getCurrentWindow(),
    {
      properties: ['openFile', 'multiSelections'],
    });

  if (files.canceled) return;

  files.filePaths.forEach(fp => {

    QueueStore.addToQueue(new QueueItemClass(
      fp,
      RendererFileHelpers.generateFileOutName(
        fp,
        { start: 0, end: 0 },
        ProcessStore.strategy,
        ProcessStore.videoSettings
      )
    ));
    eventList.file.choose({ type: 'click' });
  })

}

export const QueueComponent = observer(function QueueComponent() {

  return (
    <Paper
      elevation={0}
      className={classes.root}
    >

      <div className={classes.controls}>
        <Button onClick={add2q} variant="contained">
          add to q
        </Button>
        <Button disabled variant="contained">
          start stuff
        </Button>
        <Button disabled variant="contained">
          cancel stuff
        </Button>

        {/*FIXME DRY this code and the App.tsx code */}
        {/*FIXME decouple components from ProcessStore, maybe make contexts? */}
        <div style={{display: "flex", marginRight: 18, marginLeft: 'auto'}}>
          <FormControl>
            <InputLabel id="strategy-label">Output must</InputLabel>
            <Select
              labelId={"strategy-label"}
              value={ProcessStore.strategyType}
              variant={"standard"}
              onChange={
                e => {
                  if (e.target.value === 'max-file-size') {
                    ProcessStore.setStrategyType('max-file-size');
                  } else {
                    ProcessStore.setStrategyType('constant-quality');
                  }
                }
              }
            >
              <MenuItem value={'max-file-size'}>have max file size of</MenuItem>
              <MenuItem value={'constant-quality'}>be constant quality of</MenuItem>
            </Select>
          </FormControl>

          {ProcessStore.strategyType === 'max-file-size' ?
            <ConfigMaxFileSize/> :
            <ConfigConstantQuality/>
          }
        </div>
        <ConfigVideoSettings/>
      </div>


      <List className={classes.list}>
        {QueueStore.queue.map((x, i) => {

          return (
            <ListItem key={i} className={classes.listItem}>

              <div className={classes.itemSection}>
                <Typography>Input: {x.fileIn}</Typography>
              </div>
              <div className={classes.itemSection}>
                <Typography>Output: {x.fileOut}</Typography>
              </div>

              <div className={classes.itemSection}>
                <Typography>{JSON.stringify(x.video)}</Typography>
                &nbsp;&nbsp;
                <Typography>{JSON.stringify(x.audio)}</Typography>
                &nbsp;&nbsp;
                <Typography>{JSON.stringify(x.strategy)}</Typography>
              </div>

              <div className={classes.itemSection}>
                <Typography>error: {JSON.stringify(x.error)}</Typography>
              </div>

              <div className={classes.itemSection}>
                <Typography>done: {JSON.stringify(x.isDone)}</Typography>
                &nbsp;&nbsp;
                <Typography>started: {JSON.stringify(x.process?.started)}</Typography>
                &nbsp;&nbsp;
                <Typography>cancelled: {JSON.stringify(x.process?.cancelled)}</Typography>
              </div>

              <div className={classNames(classes.itemSection, classes.progress)}>
                <LinearProgress
                  className={classes.progressBar}
                  variant="determinate"
                  value={(x.process?.progress?.progress ?? 0) * 100}
                />
                <Typography className={classes.progressInfo}>
                  {((x.process?.progress?.progress ?? 0) * 100).toFixed(1)}%
                  {' in '}
                  {(x.process?.progress?.eta ?? 0) > 10 ? seconds2time(x.process?.progress?.eta ?? 0, 0, true) : 'a few seconds'}
                  {' | '}
                  Size: {b2text(x.process?.progress?.size ?? 0)}
                  {' '}
                  Speed: {(x.process?.progress?.speed || 0).toFixed(2)}x
                  {' '}
                  Bitrate: {bps2text(x.process?.progress?.bitrate ?? 0)}
                </Typography>
              </div>

              <div className={classes.itemSection}>
                <Button onClick={x.startProcess}>run</Button>
                <Button onClick={x.cancel}>cancel</Button>
                <Button onClick={action(() => QueueStore.queue.splice(i, 1))}>remove</Button>
              </div>
            </ListItem>
          )
        })}

        {QueueStore.queue.length === 0 && (
          <Typography variant="h6" align="center" style={{ margin: 'auto 0' }}>Queue is empty</Typography>
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
        <Paper
          className={classes.collapseHandleItem}
          onClick={() => AppState.setShowQueue(!AppState.showQueue)}
        >
          <Typography>
            {AppState.showQueue ? 'Hide Queue' : 'Show Queue'}
          </Typography>
        </Paper>
      </div>
      <QueueComponent/>
    </div>
  )
});
