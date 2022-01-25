import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'src/components/ui/Modal';
import { fire } from 'src/libs/customEvents';
import { CloseButton } from 'src/components/ui';
import classnames from 'classnames';
import { useI18n } from 'src/hooks';
import { Button, Box, Flex, IconEmpty, Heading } from '@qwant/qwant-ponents';
import { deleteSearchHistory } from 'src/adapters/search_history';
import { GREY_DARK } from '../libs/colors';
import { IconHistoryDisabled } from '../components/ui/icons';

const HistoryModal = ({ status, onClose, onAccept }) => {
  const { _ } = useI18n();

  const statuses = {
    DISABLE: {
      icon: <IconHistoryDisabled width={20} fill={GREY_DARK} className="historyModalIcon" />,
      title: _('Disable Qwant Maps history', 'history'),
      text: _('With this action, all your search history will be lost.', 'history'),
      button1: _('Cancel', 'history'),
      button2: _('Disable my history', 'history'),
      className: 'modal__history__disable',
    },
    CLEAR: {
      icon: <IconEmpty width={20} fill={GREY_DARK} className="historyModalIcon" />,
      title: _('Clear all my Qwant Maps history', 'history'),
      text: _('This action cannot be reversed', 'history'),
      button1: _('Cancel', 'history'),
      button2: _('Clear my history', 'history'),
      className: 'modal__history__delete',
    },
  };

  const { icon, title, text, button1, button2, className } = statuses[status];
  return (
    <div className="modal__maps__history">
      <Modal onClose={onClose}>
        <Box m="s" className={classnames('modal__maps', className)}>
          <CloseButton onClick={onClose} />
          <Box className="modal__maps__icon" mt="l">
            {icon}
          </Box>
          <div className="modal__maps__content">
            <Heading typo="heading-5" bold dangerouslySetInnerHTML={{ __html: title }} />
            <div
              className="modal__subtitle u-text--subtitle"
              dangerouslySetInnerHTML={{ __html: text }}
            />
            <Flex mb="xl" className="history_modal_buttons">
              <Button variant="secondary" onClick={onClose} m="xxs">
                {button1}
              </Button>
              <Button variant="primary" onClick={onAccept} m="xxs">
                {button2}
              </Button>
            </Flex>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

function close() {
  ReactDOM.unmountComponentAtNode(document.querySelector('.react_modal__container'));
}

function disable() {
  deleteSearchHistory();
  fire('disable_history');
  close();
}

function clear() {
  deleteSearchHistory();
  fire('clear_history');
  close();
}

function open(status, onClose, onAccept) {
  ReactDOM.render(
    <HistoryModal status={status} onClose={onClose} onAccept={onAccept} />,
    document.querySelector('.react_modal__container')
  );
}

export function openDisableHistoryModal() {
  open('DISABLE', close, disable);
}

export function openClearHistoryModal() {
  open('CLEAR', close, clear);
}

export default HistoryModal;
