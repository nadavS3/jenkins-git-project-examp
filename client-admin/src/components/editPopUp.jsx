import "./editPopUp.scss"
function EditPopUp(props) {

    return (
        <>
            {props.editPopUp ?
                <div id="edit-pop-up-container" >
                    <div id="edit-pop-up-center">
                        <div id="edit-pop-up" onFocus={() => props.onFocus && props.onFocus()}>
                            {props.genericShowUpSubmit ? props.genericShowUpSubmit : ''}
                        </div>
                    </div>
                </div>
                :
                ''
            }
        </>
    )
}

export default EditPopUp