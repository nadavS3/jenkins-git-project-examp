import React from 'react';
import './genericDataLoader.scss';

const GenericDataLoader = () => {
    return (
        <div id="loader-full-window">
            <div id="loader-content">
                <img id="loader-gif" src="/data-loader.svg" frameBorder={0} alt="טעינה" />
                <div id="loader-text">הנתונים בטעינה... רק עוד כמה שניות</div>
            </div>
        </div>
    )
}

export default GenericDataLoader;