import React, { useEffect, useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './TablsInfiniteScroll.scss'
import InfiniteScroll from 'react-infinite-scroller';

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

    return (
        <div id="table-container">
            <InfiniteScroll
                pageStart={0}
                loadMore={props.fetchMore ? props.fetchMore : ''}
                hasMore={!props.isLoading && !props.isEndOfUsers}
                threshold={100}

            // loader={<h4 key={0} >Loading...</h4>}
            >
                <table className="table">
                    <thead>
                        {props.th ? <tr className="tr tableHead">
                            {props.th.map((i, index) => i ? <th id="th" key={index}>{i[1]}</th> : null)}
                        </tr> : null}
                    </thead>
                    <tbody>
                        {!tr ?
                            props.loading ? // ! no such prop
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
                                    <tr key={i} className="tableBodyStyle" onClick={props.onRowClick ? e => { props.onRowClick(e, i, td) } : undefined} >
                                        {td.map((j, index) => <td key={index} className={`${typeof td[3] === 'undefined' && typeof td[1] === 'undefined' ? 'hide-border' : ''}  ${props.th ? props.th[index] && props.th[index][0] : ''}`}>{j}</td>)}
                                    </tr>
                                )
                            )
                        }
                    </tbody>
                </table>
            </InfiniteScroll>
            {
                props.navigation &&
                <div>
                    <div className='tableNavigation'>
                        <div>עמוד {page} מתוך {Math.ceil(props.resultsNum / props.rowsNum) === 0 ? 1 : Math.ceil(props.resultsNum / props.rowsNum)}</div>
                    </div>
                </div>
            }
        </div >
    );
}

export default GenericTable