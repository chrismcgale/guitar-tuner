import React, { useEffect } from 'react';
import TunerInfo from './TunerInfo';
import MetroInfo from './MetroInfo'
import Tuner from './Tuner';
import '../styles/Canvas.scss'

const Canvas = ({hand, tempo, beat, note, acceptedA}) => {
    const reset = (ctx, height, width, radius, length) => {
        // Draw tuner arc
        ctx.beginPath();
        // we want angles 315 - 45 clockwise
        ctx.arc(width / 2, height, radius, 7 * Math.PI / 4, 5 *  Math.PI / 4, true);
        ctx.stroke();
    
        // draw thin guiding lines
    }

    useEffect(() => {
        // Set up the canvas
        const canvas = document.getElementById('metronome');
        const ctx = canvas.getContext('2d');

        const radius = 100;
        const length = canvas.height - 10;
        reset(ctx, canvas.height - 10, canvas.width, radius, length);
    }, []);



    // note canvas children don't work properly, these tags are kept together because they hover over the canvas
    return (
        <div className="canvas-container">
            <TunerInfo acceptedA={acceptedA} />

            <Tuner hand={hand} tempo={tempo} note={note} />
            <canvas id="metronome" className="metronome-container" />

            <MetroInfo tempo={tempo} beat={beat} />
        </div>
    )
}

export default Canvas;