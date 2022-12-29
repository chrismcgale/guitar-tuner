import React, { useState } from 'react';
import TunerAndSoundButtons from './TunerAndSoundButtons';
import TunerInfo from './TunerInfo';
import Tuner from './Tuner';
import MetroInfo from './MetroInfo';
import MetroButtons from './MetroButtons';

import '../styles/style.scss'


const App = () => {
    const [note, setNote] = useState(0);
    const [tempo, setTempo] = useState(60);
    const [beat, setBeat] = useState(0);
    const [hand, setHand] = useState(0);
    const [acceptedA, setAcceptedA] = useState(440);

    const [tunerOn, setTunerOn] = useState(false);
    const [soundBackOn, setSoundBackOn] = useState(false);
    const [metOn, setMetOn] = useState(false);

    return (
    <>
        <TunerAndSoundButtons 
            tunerOn={tunerOn}
            setTunerOn={setTunerOn}
            soundBackOn={soundBackOn}
            setSoundBackOn={setSoundBackOn}
            metOn={metOn}
            note={note} 
            setNote={setNote} 
            acceptedA={acceptedA} 
            setAcceptedA={setAcceptedA} 
            hand={hand} 
            setHand={setHand}
        />

        <div className="canvas-container">
            <TunerInfo acceptedA={acceptedA} />

            <Tuner hand={hand} tempo={tempo} note={note} />

            <MetroInfo tempo={tempo} beat={beat} />
        </div>

        <MetroButtons  
            tunerOn={tunerOn}
            soundBackOn={soundBackOn}
            metOn={metOn}
            setMetOn={setMetOn}
            setHand={setHand} 
            beat={beat} 
            setBeat={setBeat} 
            tempo={tempo} 
            setTempo={setTempo} 
        />
    </>
)};

export default App;