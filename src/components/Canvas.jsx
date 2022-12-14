import React, { useEffect } from 'react';
import noteNames from '../enums/noteNames';
import '../styles/Canvas.scss'

const Canvas = ({hand, tempo, beat, note}) => {


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
            <canvas id="metronome" className="metronome-container" />

            <h2 id="note" className="note">{noteNames[note]}</h2>
            <div className="tempo-container">
                TEMPO <p id="tempo" className="tempo">{tempo}</p>
            </div>
            <div className="beat-container">
                BEAT <p id="beat" className="beat">{beat}</p>
            </div>

            <div className="note-arrow">&#9660;</div>
            <div id="hand" style={{transform: `rotate(${hand}deg)`, transitionDuration: `${60 / tempo}s`}} className="hand"></div>
        </div>
    )
}

export default Canvas;