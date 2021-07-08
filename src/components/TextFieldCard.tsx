import React, {useState} from 'react'
import {Button, Card, CardActions, CardContent, CardHeader, TextField} from "@material-ui/core";

type TextFieldCardProps = {
  onSave: (text: string) => void
  onCancel: () => void
  title: string
}

export function TextFieldCard({ onCancel, onSave, title }: TextFieldCardProps) {
  const [text, setText] = useState('');
  return (
    <Card>
      <CardHeader title={title}/>
      <CardContent>
        <TextField
          autoFocus
          fullWidth
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onSave(text);
            }
          }}
        />
      </CardContent>
      <CardActions>
        <div style={{ margin: '0 auto' }}/>

        <Button
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSave(text)}
          disabled={text.length === 0}
        >
          Save
        </Button>
      </CardActions>
    </Card>
  )
}
