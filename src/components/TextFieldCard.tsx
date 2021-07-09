import React, {useState} from 'react'
import {Button, Card, CardActions, CardContent, CardHeader, TextField} from "@material-ui/core";

type TextFieldCardProps = {
  onSave: (text: string) => void
  onCancel: () => void
  title: string
  placeholder?: string
  allowEmpty?: boolean
}

export function TextFieldCard({ onCancel, onSave, title, allowEmpty = false, placeholder }: TextFieldCardProps) {
  const [text, setText] = useState('');
  return (
    <Card>
      <CardHeader title={title}/>
      <CardContent>
        <TextField
          autoFocus
          fullWidth
          value={text}
          placeholder={placeholder}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (!(!allowEmpty && text.length === 0)) {
                onSave(text);
              }
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
          disabled={!allowEmpty && text.length === 0}
        >
          Save
        </Button>
      </CardActions>
    </Card>
  )
}
