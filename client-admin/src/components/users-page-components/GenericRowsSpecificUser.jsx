import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useUsersPageStore } from '../../stores/index.store';
import GenericRow from '../../generic-components/genericRow';
import GenericButton from '../../generic-components/genericButton';
import Box from '../../generic-components/Box';

import '../../consts/class_names.scss';
import './GenericRowsSpecificUser.scss';


const GenericRowsSpecificUser = () => {
    const usersPageStore = useUsersPageStore();
    const [showAll, setShowAll] = useState(false);

    return (
        <Box id="specif-user-info-container" className="width85">
            <GenericRow
                field1={{ field: 'שם פרטי: ', value: usersPageStore.specificUserData.firstName }}
                field2={{ field: 'ארגון:', value: usersPageStore.specificUserData.organizationName }}
            />
            <GenericRow
                field1={{ field: 'שם משפחה:', value: usersPageStore.specificUserData.lastName }}
                field2={{ field: 'שאלון:', value: usersPageStore.specificUserData.questionnaireTitle }}
            />
            <GenericRow
                field1={{ field: 'גיל:', value: usersPageStore.specificUserData.age }}
                button={<GenericButton
                    btnColor="blue"
                    onClick={() => { setShowAll(prevState => !prevState) }}
                    icon={showAll ? "minus" : "plus"}
                    iconSize="1x"
                    btnText={showAll ? "הסתר" : "פרטים נוספים"}
                />}
            />
            {showAll ?
                <>
                    <GenericRow
                        field1={{ field: 'עיר:', value: usersPageStore.specificUserData.city }}
                        field2={{ field: 'זמן למילוי השאלון:', value: usersPageStore.getSpecificUserTotalDuration }}
                    />
                    <GenericRow
                        field1={{ field: 'מגדר:', value: usersPageStore.specificUserData.gender }}
                        field2={{ field: 'כתובת מייל:', value: usersPageStore.specificUserData.email }}
                    />
                    <GenericRow
                        field1={{ field: 'מצב משפחתי:', value: usersPageStore.specificUserData.familyStatus }}
                        field2={{ field: 'מספר טלפון:', value: usersPageStore.specificUserData.phoneNumber }}
                    />
                    <GenericRow field1={{ field: 'אוכלוסיה:', value: usersPageStore.specificUserData.sector }} />
                    <GenericRow field1={{ field: 'מדד אוריינות דיגיטלית:', value: usersPageStore.specificUserData.DigitalOrientationLevel }} />
                    <GenericRow field1={{ field: 'מספר תשובות נכונות:', value: usersPageStore.specificUserData.correct ? usersPageStore.specificUserData.correct : 0 }} />
                    <GenericRow
                        field1={{ field: 'מספר תשובות שגויות:', value: usersPageStore.specificUserData.incorrect ? usersPageStore.specificUserData.incorrect : 0 }}
                    />
                </>
                : ""}
        </Box>
    );
}

export default observer(GenericRowsSpecificUser);