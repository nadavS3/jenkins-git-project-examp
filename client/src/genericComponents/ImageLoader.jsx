import React from 'react';
import './ImageLoader.scss';

export const ImageLoader = ({className}) => {
    return (<div className={`image-loader ${className ? className : ''}`}></div>);
}

