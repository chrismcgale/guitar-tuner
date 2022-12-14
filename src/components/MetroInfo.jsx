import React from 'react';

import '../styles/MetroInfo.scss'

const MetroInfo = ({tempo, beat}) => (
    <div className='metro-info'>
        <div className="tempo-container">
            TEMPO <p id="tempo" className="tempo">{tempo}</p>
        </div>
        <div className="beat-container">
            BEAT <p id="beat" className="beat">{beat}</p>
        </div>
    </div>
);

export default MetroInfo;