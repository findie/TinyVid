import React from "react";
import * as css from './style.css';
import {Modal as MUIModal, Paper} from "@material-ui/core";

export interface ModalProps {
  children?: React.ReactNode
  open?: boolean
  transparent?: boolean
  className?: string
  onClose?: () => void
}

export function Modal({ children, open = true, transparent = false, className = '' , onClose}: ModalProps) {

  return (
    <MUIModal
      open={open}
      disableAutoFocus={true}
      disableEnforceFocus={true}
      onClose={onClose}
    >
      <Paper elevation={3} className={css.container + ' ' + (transparent ? css.transparent : '') + ' ' + className}>
        {children}
      </Paper>
    </MUIModal>
  )

}
