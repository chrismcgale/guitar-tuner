import React from 'react';
import noteNames from '../enums/noteNames';
import '../styles/Tuner.scss'

const Tuner = ({note, hand, tempo}) => (
    <>
        <h2 id="note" className="note">{noteNames[note]}</h2>
        <div className="note-arrow">&#9660;</div>
        <div id="hand" style={{transform: `rotate(${hand}deg)`, transitionDuration: `${60 / tempo}s`}} className="hand" />
    </>
);

export default Tuner;