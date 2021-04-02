import React from "react";
import {ErrorLike} from "../../../electron/protocols/base-protocols";
import {Box, Button, Grid, Paper, Typography} from "@material-ui/core";
import {CodeDisplay} from "../code";
import {remote} from "electron";
import * as css from './style.css';
import {Modal} from "../modal";

export interface ErrorDisplayProps {
  error: Error | ErrorLike
  onOk: () => void
}

export function ErrorDisplay({ error, onOk }: ErrorDisplayProps) {

  return (
    <div style={{ minWidth: '525px' }}>

      <CodeDisplay className={css.maxHeightError}>{error.message}</CodeDisplay>
      <Box marginTop={2}>
        <Grid container spacing={2} justify={"flex-end"} wrap={"nowrap"}>

{/*          <Grid item>*/}
{/*            <Button variant={"contained"} color={"secondary"} onClick={() => {*/}
{/*              remote.shell.openPath(`https://github.com/legraphista/QuickTrim/issues`);*/}
{/*            }}>*/}
{/*              View existing reports*/}
{/*            </Button>*/}
{/*          </Grid>*/}

{/*          <Grid item>*/}
{/*            <Button variant={"contained"} color={"primary"} onClick={() => {*/}

{/*              const codeBlock = '```';*/}
{/*              const c = '`';*/}
{/*              const title = 'Error: ' + error.message.split('\n')[0].substr(0, 120);*/}
{/*              const contents = `*/}
{/*Message: */}
{/*${codeBlock}*/}
{/*${error.message}*/}
{/*${codeBlock}*/}

{/*Stack: */}
{/*${codeBlock}*/}
{/*${error?.stack?.replace(error.message, '')}*/}
{/*${codeBlock}*/}
{/*`;*/}
{/*              remote.shell.openPath(`https://github.com/legraphista/QuickTrim/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(contents)}`);*/}
{/*            }}>*/}
{/*              Submit error report*/}
{/*            </Button>*/}
{/*          </Grid>*/}

          <Grid item>
            <Button variant={"contained"} onClick={onOk}>
              Ok
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export function ErrorDisplayModal(props: ErrorDisplayProps) {
  return (
    <Modal>
      <Paper elevation={3}>
        <Box padding={1}>
          <Typography align={"center"}>
            <strong>Oops...</strong> something went wrong!
          </Typography>
        </Box>
      </Paper>

      <Box padding={2}>
        <ErrorDisplay {...props}/>
      </Box>
    </Modal>
  );
}
