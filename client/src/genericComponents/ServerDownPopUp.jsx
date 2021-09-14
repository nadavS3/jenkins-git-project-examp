import React, { useEffect } from 'react';
import './ServerDownPopUp.scss';
import { useGenAlert } from '../contexts/generalAlertCtx'
import { useUsersStore } from '../stores/index.store';
import { observer } from 'mobx-react-lite';
function ServerDownPopUp(props) {
    const genAlertCtx = useGenAlert()
    const usersStore = useUsersStore();
    useEffect(() => {
        genAlertCtx.openGenAlert({ text: usersStore.errorPopUpMessage })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <></>
    );
}

export default observer(ServerDownPopUp);