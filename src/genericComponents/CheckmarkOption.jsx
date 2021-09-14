import React, { useEffect, useRef } from 'react';

// CheckmarkOption- This component adds an option with a checkmark and check if the user has checked the option or not
/**
 * @Prop isChecked           -> boolean - Whether the option is checked or not 
 *       if true -> The filter drop down will allow  multi select
 * @Prop options             -> Array of strings
 * @Prop handleOptionSelect  -> function - This will be execute when the userr will choose an option
 *       This function will get 2 parameters :
 *       -1) The chosen option 
 *       -2) Whether the option is checked or not - it is up to you to update selectedOption / selectedOptions
 */

const CheckmarkOption = ({ handleOptionSelect, option, isChecked }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef && canvasRef.current) {
            if (isChecked) {
                canvasRef.current.style.opacity = 1;
                animatedVSign();
            }
            else canvasRef.current.style.opacity = 0;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef]);

    const animatedVSign = () => {
        const start = 100;
        const mid = 145;
        const end = 250;
        const width = 10;
        var leftX = start;
        var leftY = start;
        var rightX = mid - (width / 2.7);
        var rightY = mid + (width / 2.7);
        const animationSpeed = 3;

        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth = width;
        ctx.strokeStyle = 'rgb(1, 1, 1)';
        ctx.beginPath();
        ctx.moveTo(start, start);
        ctx.lineTo(leftX, leftY);
        ctx.stroke();
        leftX++;
        leftY++;
        for (let i = start + 1; i < mid; i++) {
            setTimeout(() => {
                ctx.beginPath();
                ctx.moveTo(start, start);
                ctx.lineTo(leftX, leftY);
                ctx.stroke();
                leftX++;
                leftY++;
            }, 1 + (i * animationSpeed) / 3);
        }

        for (let i = mid; i < end; i++) {
            setTimeout(() => {
                ctx.beginPath();
                ctx.moveTo(leftX, leftY);
                ctx.lineTo(rightX, rightY);
                ctx.stroke();
                rightX++;
                rightY--;
            }, 1 + (i * animationSpeed) / 3);
        }
    }

    const handleCheck = (isChecked) => {
        if (canvasRef && canvasRef.current) {
            if (isChecked) {
                canvasRef.current.style.opacity = 1;
                animatedVSign();
            }
            else canvasRef.current.style.opacity = 0;
        }
    }

    return (
        <div className="option" >
            <div className="checkmark clickable" onClick={() => { handleCheck(!isChecked); handleOptionSelect(option, !isChecked) }}>
                <canvas id='v-sign' ref={canvasRef}></canvas>
            </div>
            {option}</div>
    );
}

export default CheckmarkOption;