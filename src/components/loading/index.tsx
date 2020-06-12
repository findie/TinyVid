import React from "react";
import {Modal} from "../modal";
import {CircularProgress} from "@material-ui/core"

export interface LoadingProps {
  percentage?: number
  indeterminate?: boolean
  size?: number
}

export function Loading({ percentage = 0, indeterminate = true, size = 100 }: LoadingProps) {

  return (
    <Modal transparent={true}>
      <CircularProgress
        size={size}
        style={{ color: 'white' }}
        value={percentage}
        variant={indeterminate ? 'indeterminate' : "determinate"}
      />
    </Modal>
  )

}