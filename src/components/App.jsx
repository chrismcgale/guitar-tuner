import React, { useState } from 'react';
import TunerAndSoundButtons from './TunerAndSoundButtons';
import Canvas from './Canvas';
import MetroButtons from './MetroButtons';

import '../styles/style.scss'


const App = () => {
    const [note, setNote] = useState('A');
    const [tempo, setTempo] = useState(60);
    const [beat, setBeat] = useState(0);
    const [hand, setHand] = useState(0);
    const [metronomeOn, setMetronomeOn] = useState(false);
    const [acceptedA, setAcceptedA] = useState(440);
    

    return (
    <>
        <TunerAndSoundButtons note={note} setNote={setNote} acceptedA={acceptedA} setAcceptedA={setAcceptedA} setMetronomeOn={setMetronomeOn} hand={hand} setHand={setHand}/>

        <Canvas note={note} tempo={tempo} beat={beat} hand={hand} acceptedA={acceptedA} />

        <MetroButtons hand={hand} setHand={setHand} beat={beat} setBeat={setBeat} tempo={tempo} setTempo={setTempo} metronomeOn={metronomeOn} setMetronomeOn={setMetronomeOn} />
    </>
)};

export default App;