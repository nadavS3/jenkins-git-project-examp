import React, { useEffect, useState, useRef } from "react";
// import PropTypes from "prop-types";
import './Autocomplete.scss';
import { compareCityToDataBase } from '../../consts/functions'
import { cityRegExp } from '../../consts/RegExps'
import { useUsersStore } from '../../stores/index.store'
import { isMobileOnly } from "react-device-detect";
function AutocompleteCopy(props) {

    const usersStore = useUsersStore();
    // const defaultProps = {
    //     suggestions: []
    // };


    const currentRef = useRef(null);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [isWarningNeeded, setIsWarningNeeded] = useState(false);
    useEffect(() => {
        if (currentRef.current) { currentRef.current.scrollIntoView({ behavior: "smooth", block: "end" }); }

    }, [activeSuggestion])

    const onChange = e => {

        const { suggestions } = props;
        const userInput = e.currentTarget.value;
        if (userInput.length > 20) {
            return
        }
        if (isMobileOnly) {
            window.scrollTo({ top: 250, left: 0, behavior: "smooth" })
        }
        const check = cityRegExp.test(userInput);
        if (check || !userInput) {

            props.setCity(userInput);
            // Filter our suggestions that don't contain the user's input
            const filteredSuggestions = suggestions.filter(
                suggestion =>
                    suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
            );

            // Update the user input and filtered suggestions, reset the active
            // suggestion and make sure the suggestions are shown

            if (filteredSuggestions.length > 0) {
                setShowSuggestions(true)
                setActiveSuggestion(0)
                setUserInput(e.currentTarget.value)
                setFilteredSuggestions(filteredSuggestions)
                setIsWarningNeeded(false)
            }
            else {
                setShowSuggestions(false)
                setActiveSuggestion(0)
                setUserInput(e.currentTarget.value)
                setFilteredSuggestions(filteredSuggestions)
                setIsWarningNeeded(false)
            }
        }
        else { setIsWarningNeeded(true) }

    };

    const onClick = e => {
        props.setCity(e.currentTarget.innerText);

        // Update the user input and reset the rest of the state
        setActiveSuggestion(0)
        setFilteredSuggestions([])
        setShowSuggestions(false)
        setUserInput(e.currentTarget.innerText)

    };

    // Event fired when the user presses a key down
    const onKeyDown = e => {


        // User pressed the enter key, update the input and close the
        // suggestions


        if (filteredSuggestions.length > 0) {
            if (e.keyCode === 13) {
                setShowSuggestions(false)
                setActiveSuggestion(0)
                setUserInput(filteredSuggestions[activeSuggestion])
                setFilteredSuggestions([])
                props.setCity(filteredSuggestions[activeSuggestion]);
            }
            else if (e.keyCode === 38) {

                if (activeSuggestion === 0) {

                    return;
                }
                if (activeSuggestion === filteredSuggestions.length) {

                    return;
                }
                setActiveSuggestion(prevState=>prevState - 1)

            }
            // User pressed the down arrow, increment the index
            else if (e.keyCode === 40) {
                if (activeSuggestion === filteredSuggestions.length) {
                    return;
                }
                setActiveSuggestion(prevState=>prevState + 1)

            }
        }
    };

    let suggestionsListComponent;
    let className;

    if (showSuggestions && userInput) {
        if (filteredSuggestions.length) {

            suggestionsListComponent = (
                <ul id={isMobileOnly ? "mobile-list" : null} className="suggestions">
                    {filteredSuggestions.map((suggestion, index) => {
                        className = 0;
                        // Flag the active suggestion with a class
                        if (index === activeSuggestion) {
                            className = "suggestion-active";
                        }
                        if (activeSuggestion === filteredSuggestions.length) {
                            setActiveSuggestion(filteredSuggestions.length - 1)
                        }
                        return (
                            <li
                                className={className}
                                key={suggestion}
                                onMouseDown={onClick}
                                ref={index === activeSuggestion ? currentRef : null}
                                id={'a' + (index)}
                            >
                                {suggestion}
                            </li>
                        );
                    })}
                </ul>
            );
        }
        else {

            if (!compareCityToDataBase(userInput)) { suggestionsListComponent = 'אין הצעות זמינות' }
        }
    }
    if (isWarningNeeded) {
        suggestionsListComponent = 'אנא הכנס תווים תקינים בעברית'
    }

    // if (userInput.length > 20) { suggestionsListComponent = 'מספר מקסימלי של תווים הוכנס' }
    return (
        <div id='autocomplete-inner'>
            <input
                type="text"
                onChange={onChange}
                onKeyDown={onKeyDown}
                value={userInput}
                className={`input-style ${isMobileOnly ? "mobile-input" : ""}`}
                onBlur={() => {
                    setFilteredSuggestions([]);
                    setIsWarningNeeded(false);
                    usersStore.setIsKeyboardFocused(false);
                }}
                onFocus={() => { usersStore.setIsKeyboardFocused(true) }}
            />
            {typeof suggestionsListComponent === 'string' ? <div className="error-message">{suggestionsListComponent}</div> : <div id="auto-complete-options-pop-up">{suggestionsListComponent} </div>}
        </div>
    );
}
//! need to check why not working
// AutocompleteCopy.propTypes = {
//     suggestions: PropTypes.instanceOf(PropTypes.array)
// };

export default AutocompleteCopy;
