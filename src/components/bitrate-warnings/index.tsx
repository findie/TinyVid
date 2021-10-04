import React, {useEffect, useState} from "react";
import {Collapse} from "@material-ui/core";
import {Alert, AlertProps, AlertTitle} from "@material-ui/lab"
import {observer} from "mobx-react";
import {ProcessStore} from "../../global-stores/Process.store";
import {AlertVariants, BitrateWarningStore} from "./BitrateWarning.store";


const alertMessages: ({ [s in AlertVariants]: { title: string, text: string, severity: AlertProps['severity'], type: AlertVariants } }) = {
  corrupt: {
    title: 'Your video will corrupt!',
    text: 'Reduce video duration, fps, resolution or increase file size.',
    severity: "error",
    type: "corrupt"
  },
  bad: {
    title: 'Video may look blocky!',
    text: 'Depending on how much movement there is, you may have to reduce video duration, fps, resolution or increase file size.',
    severity: "warning",
    type: 'bad',
  },
  artifacts: {
    title: 'Some artifacts may occur!',
    text: 'Depending on how much movement there is, you may experience some visual quality loss.',
    severity: 'warning',
    type: "artifacts"
  },
  ok: {
    title: 'All looks to be Ok!',
    text: '',
    severity: 'success',
    type: "ok"
  },
  waste: {
    title: 'You may be wasting space!',
    text: 'It is possible to lower the file size or increase resolution or fps without losses.',
    severity: 'warning',
    type: "waste"
  }
}

export interface BitrateWarningsProps {
  className?: string
}

export const BitrateWarnings = observer(function BitrateWarnings(props: BitrateWarningsProps) {

  const [suppress, setSuppress] = useState(false);
  const [lastAlert, setLastAlert] = useState<AlertVariants>("ok");

  const videoDetails = ProcessStore.videoDetails;
  const alertData = alertMessages[BitrateWarningStore.alertType]

  useEffect(() => {

    if (lastAlert !== alertData?.type) {
      setLastAlert(alertData?.type || 'ok');
      setSuppress(false);
    }

  }, [alertData])


  if (!videoDetails) {
    return null;
  }
  if (ProcessStore.strategyType !== "max-file-size") {
    return null;
  }

  function temp_close_alert() {
    console.log('should suppress alert')
    setSuppress(true);
  }

  if (suppress) {
    return null;
  }

  return (
    <div className={props.className}>
      <Collapse in={alertData.type !== 'ok'} timeout={{ exit: 6000 }} style={{ transitionDelay: alertData.type === 'ok' ? '3s' : '0ms' }}>
        <Alert elevation={6} severity={alertData.severity} variant={'standard'} onClose={temp_close_alert}>
          <AlertTitle>{alertData.title}</AlertTitle>
          {alertData.text}
        </Alert>
      </Collapse>
    </div>
  );
});
