import React from 'react';

import '../styles/MetroInfo.scss'

const MetroInfo = ({tempo, beat}) => (
    <div className='metro-info'>
        <div className="tempo-container">
        <p id="tempo" className="tempo">TEMPO {tempo}</p>
        </div>
        <div className="beat-container">
        <p id="beat" className="beat">BEAT {beat}</p>
        </div>
    </div>
);

export default MetroInfo;