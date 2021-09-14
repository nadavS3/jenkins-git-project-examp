import React, { useEffect, useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Table.scss'

/** props:
  * @Props th- array of arrays with the name of the headline in english and the language of the page. like: [['name', 'שם'], ['phone', 'פלאפון']]
  * @Props tr- array of arrays with the html elements of the row in the order of the th. like: [[<div>ראשית</div>, <div>0556683720</div>], [<div>מעיין</div>, <div>0556653379</div>]]
  * @Props loading- boolean, true if the table loads.
  * @Props navigation- boolean, arrows back and forward.
          if navigation is true:
              @Prop prevPage- function, onClick the right arrow.
              @Prop nextPage- function, onClick the left arrow.
              @Prop rowsNum- the number of rows for each page
              @Prop resultsNum- the number of all the columns in the database. like: יש לי 345 אנשים שמחפשים בעל תוקע ואני מראה רק 20 מתוכם. המספר של הפרופס הוא 345
    @Prop onRowClick- onClick event to happen on click of single row, passes the event and the index 
*/

const GenericTable = (props) => { // ראשית
    const [tr, setTr] = useState(null)
    const [page, setPage] = useState(1)

    useEffect(() => {
        if (props.tr) setTr(props.tr)
    }, [props.tr])

    useEffect(() => {
        setPage(1)
    }, [props.resultsNum])

    // const prevPageClicked = () => {
    //     if (1 === page) return
    //     setPage(prev => {
    //         props.prevPage(prev - 1)
    //         return prev - 1
    //     })
    // } // todo check if needed

    // const nextPageClicked = () => {
    //     if (Math.ceil(props.resultsNum / props.rowsNum) === page) return
    //     setPage(prev => {
    //         props.nextPage(prev + 1)
    //         return prev + 1
    //     })
    // } // todo check if needed

    //* function for specificUser , we want to check if the current tr is a row with the image and question description rather then ordinary row
    const checkIfSpecial = (columnOne, columnThree) => {
        //* we check the type od column 3 , this column is not defined in a special questiondata case so we check if its undefined, also column one normally will 
        //*store a number of time but now will be also undefined so we check for that also
        if (typeof columnThree === 'undefined' && typeof columnOne.props.children[1] === 'undefined') return true
        return false
    }

    return (
        <div id="table-container">
            <table className="table">
                <thead>
                    {props.th ? <tr className="tr tableHead">
                        {props.th.map((i, index) => i ? <th id="th" key={index}>{i[1]}</th> : null)}
                    </tr> : null}
                </thead>
                <tbody>
                    {!tr ?
                        props.loading ?
                            <tr className='tr headLine'>
                                <td colSpan="9" className='noRes'>
                                    <div className='loading-spiner'></div>
                                </td>
                            </tr> :
                            <tr className='tr headLine'>
                                <td colSpan="9" className='noRes'>אירעה שגיאה, נסה שנית מאוחר יותר</td>
                            </tr> :
                        (!tr.length ?
                            <tr className='tr headLine'>
                                <td colSpan="9" className='noRes'>לא נמצאו תוצאות</td>
                            </tr> :

                            tr.map((td, i) =>
                                <tr key={i} className={`tableBodyStyle `} onClick={props.onRowClick ? e => { props.onRowClick(e, i, td) } : undefined} >
                                    {td.map((j, index) => <td key={index} id='td' className={`in-table ${props.th ? props.th[index] && props.th[index][0] : ''} ${checkIfSpecial(td[1], td[3]) ? 'hide-border' : ''}`}>{j}</td>)}
                                </tr>
                            )
                        )
                    }
                </tbody>
            </table>
            {
                props.navigation &&
                <div>
                    <div className='tableNavigation'>
                        {/* <FontAwesomeIcon icon={['fas', "chevron-right"]} className={'navArrow' + (page === 1 ? ' disabledNavArrow' : '')} onClick={prevPageClicked} /> */}
                        <div>עמוד {page} מתוך {Math.ceil(props.resultsNum / props.rowsNum) === 0 ? 1 : Math.ceil(props.resultsNum / props.rowsNum)}</div>
                        {/* <FontAwesomeIcon icon={['fas', "chevron-left"]} className={'navArrow' + ((Math.ceil(props.resultsNum / props.rowsNum) === 0 ? 1 : Math.ceil(props.resultsNum / props.rowsNum)) === page ? ' disabledNavArrow' : '')} onClick={nextPageClicked} /> */}
                    </div>
                </div>
            }
        </div >
    );
}

export default GenericTable