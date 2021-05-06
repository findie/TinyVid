/**
 Copyright Findie 2021
 */
import React, {useCallback, useState} from "react";
import {Modal} from "../modal";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  MenuItem,
  TextField
} from "@material-ui/core";
import * as css from './style.css';
import {RendererSettings} from "../../helpers/settings";
import {remote} from 'electron';
import {readAllLogs} from "../../../electron/helpers/log";
import * as path from "path";

export function FeedbackModal({ onClose, open }: { onClose?: () => void, open: boolean }) {

  const [email, setEmail] = useState('');
  const [type, setType] = useState('feedback');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clearFields = useCallback(() => {
    setEmail('');
    setType('feedback');
    setText('');
  }, [setEmail, setType, setText])

  const validate = useCallback(() => {

    if (email && !/.*@.*\..*/.test(email)) {
      setError('Email looks invalid');
      return false;
    }

    if (!text) {
      setError('Text field is required');
      return false;
    }
    if (!type) {
      setError('Type is required');
      return false;
    }

    setError('');
    return true;

  }, [text, type, email, setError])

  const sendFeedback = useCallback(() => {
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    const logs = readAllLogs().map(x => ({
      filename: path.basename(x.path),
      contents: x.lines.join('\n')
    }));

    fetch('https://feedback.tinyvid.io', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        _files: logs,
        Version: remote.app.getVersion(),
        ID: RendererSettings.settings.ID,
        Email: email || '<unset>',
        Type: type,
        Text: text
      })
    })
      .then(() => {
        clearFields();
        setLoading(false);
        if (onClose) {
          onClose();
        }
      })
      .catch(e => {
        setLoading(false);
        console.error(e);
        setError('There was an issue submitting your feedback, sorry!');
      });
  }, [
    onClose,
    setError,
    setLoading,
    clearFields,
    type,
    email,
    text
  ])

  return (
    <Modal onClose={onClose} open={open}>
      <Card className={css.root}>
        <CardContent>
          <FormControl>
            <TextField
              label="Email (Optional)"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
            />
            <FormHelperText>We do not share your email or subscribe you to anything.</FormHelperText>

            <TextField
              className={css.padVertical}
              select
              label="Type"
              required
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <MenuItem value="feedback"> Feedback </MenuItem>
              <MenuItem value="question"> Question </MenuItem>
              <MenuItem value="feature"> Feature Request </MenuItem>
              <MenuItem value="issue"> Issue </MenuItem>
            </TextField>

            <TextField
              multiline
              rows="10"
              fullWidth
              required
              placeholder={
                type === 'issue' ? 'I\'d like to report an issue...' :
                  type === 'question' ? 'I have a question...' :
                    type === 'feature' ? 'I\'d like to be able to...' :
                      "Your text goes here..."
              }
              value={text}
              onChange={e => setText(e.target.value)}
            />

            {error && (
              <>
                <Divider/>
                <FormHelperText error>{error}</FormHelperText>
              </>
            )}
          </FormControl>
        </CardContent>
        <Divider/>
        <CardActions className={css.right}>
          <Button
            variant="text"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={sendFeedback}
          >
            Send
          </Button>
        </CardActions>
      </Card>
    </Modal>
  )

}
