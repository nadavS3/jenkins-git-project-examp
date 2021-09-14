import React from 'react';
import './Box.scss';

export const Box = ({ children, className, id }) => {

    /**
     * @Prop className: string | Array<string>
     * @Prop id: string
     */

    const classNames = Array.isArray(className) ? className.join(" ") : className

    return (
        <div className={"box-container no-scroller " + (classNames || "")} id={id || undefined}>
            {children}
        </div>
    );
}

export default Box;