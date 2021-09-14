import React, { useEffect, useRef } from "react";
import './V_Animation.scss';

const V_Animation = ({ check }) => {

    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef && canvasRef.current) {
            if (check) {
                canvasRef.current.style.opacity = 1;
                animatedVSign();
            }
            else {
                canvasRef.current.style.opacity = 0;
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [check]);

    const animatedVSign = () => {

        const start = 75;
        const mid = 120;
        const end = 225;
        const width = 20;
        let leftX = start;
        let leftY = start;
        let rightX = mid - (width / 2.7);
        let rightY = mid + (width / 2.7);
        const animationSpeed = 3;

        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth = width;
        ctx.strokeStyle = '#103d6b';
        ctx.beginPath();
        ctx.moveTo(start, start);
        ctx.lineTo(leftX, leftY);
        ctx.stroke();
        leftX++;
        leftY++;
        for (let i = start + 1; i < mid; i++) {
            // eslint-disable-next-line
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
            // eslint-disable-next-line
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
    return (
        <div className="checkmark">
            <canvas id='v-sign' ref={canvasRef}></canvas>
        </div>
    );
}

export default V_Animation;