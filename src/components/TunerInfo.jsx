import React from 'react';

import '../styles/TunerInfo.scss'

const TunerInfo = ({acceptedA}) => (
    <div className='tuner-info'>
        <div className="tempo-container">
            TUNER <p id="tempo" className="tempo">{acceptedA}Hz</p>
        </div>
    </div>
);

export default TunerInfo;