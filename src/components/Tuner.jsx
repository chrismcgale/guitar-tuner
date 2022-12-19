import React from 'react';
import noteNames from '../enums/noteNames';

const Tuner = ({note, hand, tempo}) => (
    <>
        <h2 id="note" className="note">{note}</h2>
        <div className="note-arrow">&#9660;</div>
        <div id="hand" style={{transform: `rotate(${hand}deg)`, transitionDuration: `${60 / tempo}s`}} className="hand" />
    </>
);

export default Tuner;