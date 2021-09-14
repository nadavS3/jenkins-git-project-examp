import React, { useMemo } from 'react'
import { useTable } from "react-table"
import { useUsersPageStore } from '../../stores/index.store';
import { ANSWER_STATUS, QUESTION_TYPES } from '../../consts/consts';
import { Box } from '../../generic-components/Box';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import "./specificUserTable.scss";
import "../../consts/class_names.scss";

const th = [
    ['question', 'שאלה'],
    ['time', 'זמן'],
    ['result', 'תוצאה'],
    ['arrowImage', '']
];

const SpecificUserTable = ({ handleImgClick, arrowUpIndex, setArrowUpIndex }) => {
    const usersPageStore = useUsersPageStore();



    const resolveAnswerStatus = (answerStatus) => {
        let imgPath;
        switch (answerStatus) {
            case ANSWER_STATUS.INCORRECT:
                imgPath = "images/icons/IncorrectIcon.svg"
                break;
            case ANSWER_STATUS.CORRECT:
                imgPath = "images/icons/CorrectIcon.svg"
                break;
            case ANSWER_STATUS.SKIPPED:
                imgPath = "images/icons/QuestionMarkIcon.svg"
                break;
            default:
                throw Error("bad answer status")
        }
        return <img src={imgPath} alt="" className="answer-icon" />

    }


    const resolveArrowClick = async (question, index) => {

        //* if no arrow is up
        if (arrowUpIndex === -1) { setArrowUpIndex(index); }
        //* if arrowup is = to the current arrow
        else if (index === arrowUpIndex) { setArrowUpIndex(-1); usersPageStore.removeOpenQuestionRow(index); return }
        //*means that arrowupindex is not -1 so a row is open and not this row so another row is open
        else {
            if (index > arrowUpIndex) {
                usersPageStore.removeOpenQuestionRow(arrowUpIndex)
                setArrowUpIndex(index - 1)
                usersPageStore.fetchQuestionData(question, index - 1);
                return
            }
            usersPageStore.removeOpenQuestionRow(arrowUpIndex)
            setArrowUpIndex(index)
            usersPageStore.fetchQuestionData(question, index);
            return;
        }
        await usersPageStore.fetchQuestionData(question, index);

    }

    const resolveArrowImg = (question, index) => {
        return <div id="tbody-td-arrow-container" >
            <img className={`arrow-icon ${index === arrowUpIndex ? "arrow-up" : "arrow-down"} `} onClick={() => resolveArrowClick(question, index)} src="images/icons/Icon-arrow-down.svg" alt="" />
        </div>
    }
    const resolveUserAnswerImg = question => {
        const { imagePath, styleUserAnswerEval, answerStatus, questionType } = question;
        return (
            <div id="td-user-answer-img-container" onClick={handleImgClick}>
                {questionType === QUESTION_TYPES.PSQ ? <div className={`td-user-answer-${answerStatus.toLowerCase()}`} style={toJS(styleUserAnswerEval)}></div> : ""}
                <img id="td-user-answer-img" src={imagePath} alt="תשובה" />
            </div>
        )

    }
    const data = React.useMemo(
        () => usersPageStore.specificUserQuestions.map((question, indexRow) => {
            if ("questionNumber" in question) {
                // console.log(question);
                const { questionNumber, answerDuration, answerStatus } = question;
                let tableRow = {
                    question: <div className="td-q" >{questionNumber}</div>,
                    time: <div className="td-t">   {answerDuration}</div>,
                    result: resolveAnswerStatus(answerStatus),
                    arrowImage: resolveArrowImg(question, indexRow)
                };
                return tableRow;
            }
            //special row
            else {
                const { questionInstruction, questionStory } = question;
                let tableRow = {
                    question: <div className="td-q" >{(questionStory ? questionStory : "") + questionInstruction}</div>,
                    time: <div className="td-t"></div>,
                    result: <div id="td-user-answer-border" >{resolveUserAnswerImg(question)}</div>,
                    arrowImage: <div id="search-plus-container" >
                        <FontAwesomeIcon id="search-plus-icon" onClick={handleImgClick} icon="search-plus" color="#103D6B" size="2x" />
                    </div>
                };
                return tableRow
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }), [usersPageStore.specificUserQuestions, arrowUpIndex]
    )


    const columns = useMemo(() => th.map(thElem => {
        let thObject = {
            accessor: thElem[0], // accessor is the "key" in the data
            Header: <div className="th-c" >{thElem[1]}</div>
        }
        return thObject;
    }), [])

    const tableInstance = useTable({ columns, data })

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance


    return (
        // apply the table props
        <Box className="width85 no-scroll" id="user-answer-container">
            <table id="table-id" {...getTableProps()}>
                <thead>
                    {// Loop over the header rows
                        headerGroups.map(headerGroup => (
                            // Apply the header row props
                            <tr id="thead-tr-id" className="t-general " {...headerGroup.getHeaderGroupProps()}>
                                {// Loop over the headers in each row
                                    headerGroup.headers.map(column => (
                                        // Apply the header cell props
                                        <th className="thead-th" {...column.getHeaderProps()}>
                                            {// Render the header
                                                column.render('Header')}
                                        </th>
                                    ))}
                                {/* </div> */}
                            </tr>
                        ))}
                </thead>
                {/* Apply the table body props */}
                <tbody {...getTableBodyProps()}>
                    {// Loop over the table rows
                        rows.map(row => {
                            // Prepare the row for display
                            prepareRow(row)
                            return (
                                // Apply the row props
                                <tr className="tbody-tr t-general t-blue" {...row.getRowProps()}>
                                    {/* <div className="tbody-tr t-general t-blue" > */}
                                    {// Loop over the rows cells
                                        row.cells.map(cell => {
                                            // Apply the cell props
                                            return (
                                                <td className="tbody-td" {...cell.getCellProps()}>
                                                    {// Render the cell contents
                                                        cell.render('Cell')}
                                                </td>
                                            )
                                        })}
                                    {/* </div> */}
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        </Box>
    )
}

export default observer(SpecificUserTable)
