import React, { useState } from 'react';
import CheckmarkOption from './CheckmarkOption';
import './genericFilterDropDown.scss';

// FilterDropDown - This component renders a filter with options and calls a function ,you pass it to it, to handle choosing an option.
/**
 * @Prop  multiSelect         -> boolean - default false
 if true -> The filter drop down will allow  multi select
 * @Prop  options             -> Array of strings:
 * @Prop  handleOptionSelect  -> function - This will be execute when the userr will choose an option
          This function will get 2 parameters :
          --1) The chosen option 
          --2) (only for multiSelect) Whether the option is checked or not - it is up to you to update selectedOptions
 * @Prop  selectedOptions     -> array of string - All the options the user selected
 * @Prop  selectedOption      -> string - The chosen option
 * 
//  * @Optional @Prop selectedOptionId     -> the id of the chosen option // not in use
//  * @Optional @Prop optionsIds     -> the id of the chosen option // not in use
 * */
const FilterDropDown = ({ multiSelect, options, handleOptionSelect, selectedOption, selectedOptions }) => {
    const [openOptions, setOpenOptions] = useState(null);

    const openOrCloseOptions = () => {
        setOpenOptions((isOptionsOpened) => !isOptionsOpened);
    }

    return (<div id="filter-container" className="single-filter" >
        <div id="selected-option" className="clickable" onClick={openOrCloseOptions} tabIndex='1' onBlur={() => setOpenOptions(false)}>
            <div id="display-selection" className="no-scroller">{multiSelect ? selectedOptions.map((opt) => `${opt}, `) : selectedOption}</div>
            <img alt="" src='images/icons/Icon-arrow-down.svg' />
        </div>

        <div id="options-container" className={`${openOptions === true ? 'scale-in-ver-top' : openOptions === false ? 'scale-out-ver-top' : 'display-none'}`} >
            {(options && Array.isArray(options)) ? options.map((option) => {
                if (multiSelect) {
                    const isChecked = selectedOptions && selectedOptions.length ? selectedOptions.some((selOpt) => selOpt === option) : false;
                    return (
                        <CheckmarkOption key={option} handleOptionSelect={handleOptionSelect} option={option} isChecked={isChecked} />
                    );
                }
                else return <div className={`option clickable ${selectedOption === option ? 'bolder-font' : ''}`} key={option} onClick={() => handleOptionSelect(option)}>{option}</div>
            }) : null}
        </div>
    </div>);
}
export default FilterDropDown;