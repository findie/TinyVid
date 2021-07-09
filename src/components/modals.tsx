
/**
 Copyright Findie 2020
 */
import React, { useCallback, useState } from 'react';
import {Modal} from "./modal";

type AutoModalContent = React.ReactNode | ((props: { closeModal: () => void }) => React.ReactNode);

export type AutoModalProps = {
  onOpen?: () => void
  onClose?: () => void

} & ({
  content: AutoModalContent
  children: React.ReactElement
} | {
  children: AutoModalContent
  trigger: React.ReactElement
});

/**
 * @description Can be used like <ModalTrigger content>{trigger}</ModalTrigger>
 *              or like          <ModalTrigger trigger>{content}</ModalTrigger>
 * */
export function ModalTrigger(props: AutoModalProps) {
  const {
    onOpen = () => undefined,
    onClose = () => undefined,
  } = props;

  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => {
    setOpen(true);
    onOpen();
  }, [onOpen, setOpen]);
  const closeModal = useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose, setOpen]);

  const content: AutoModalContent = 'content' in props ? props.content : props.children;
  const trigger: React.ReactElement = 'trigger' in props ? props.trigger : props.children;

  return (
    <>
      {React.cloneElement(trigger, { onClick: openModal })}

      <Modal open={open} onClose={closeModal}>
        {typeof content === 'function' ? content({ closeModal }) : content}
      </Modal>
    </>
  );
}
