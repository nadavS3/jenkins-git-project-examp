
import React, { useEffect, useState } from 'react'

import { he } from 'date-fns/locale'
import { DateRangePickerCalendar, START_DATE } from 'react-nice-dates'

import './customDate.scss';


export const CustomDate = ({ setDateRange, handleBlur }) => {
    const [focus, setFocus] = useState(START_DATE);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    useEffect(() => {
        if (endDate) {
            setDateRange(startDate, endDate);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    const handleFocusChange = newFocus => {
        setFocus(newFocus || START_DATE)
    }

    return (
        <>
            <div id="date-ranger-picker-container" dir="ltr" >
                <DateRangePickerCalendar
                    startDate={startDate}
                    endDate={endDate}
                    focus={focus}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onFocusChange={handleFocusChange}
                    locale={he}
                />
            </div>
            <div id="date-ranger-background" onClick={handleBlur}></div>
        </>
    );
} 