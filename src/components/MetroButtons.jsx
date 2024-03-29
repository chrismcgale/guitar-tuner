import React, { useRef, useEffect } from 'react';
import '../styles/MetroButtons.scss'

const MetroButtons = ({
    tunerOn,
    soundBackOn,
    metOn,
    setMetOn,
    setHand, 
    tempo, 
    setTempo, 
    beat, 
    setBeat, 
}) => {
    const metInt = useRef(null);
    const minTempo = 30;
    const maxTempo = 252;
    let lastTime = 0;

    useEffect(() => {
        // clear interval on off
        if (!metOn) clearInterval(metInt.current);
    }, [metOn] );

    const tap = () => {
        // then oscilate between left and right
        let rotate = -45;
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        console.log(metInt)
        metInt.current = setInterval(() => {
            setHand(rotate);
            rotate *= -1;
            // play sound
            let o = audioCtx.createOscillator();
            let g = audioCtx.createGain();
            o.type = 'triangle';
            o.connect(g);
            o.frequency.value = 440;
            g.connect(audioCtx.destination);
            o.start(0);
            g.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1);
        }, (60 / tempo) * 1000);
    }

    const tapTempo = () => {
        if (lastTime !== 0) {
            const now = new Date();
            const seconds = Math.abs(now.getTime() - lastTime.getTime())/1000;
            setTempo(Math.floor(60 / (seconds)));
            lastTime = now;
        } else {
            lastTime = new Date();
        }
    };


    const increaseTempo = () => {
        const inc = Math.floor(tempo / 20);
        if (tempo + inc > maxTempo) setTempo(minTempo);
        else setTempo(tempo + inc);
    }

    const decreaseTempo = () => {
        const dec = Math.floor(tempo / 20);
        if (tempo + dec > minTempo) setTempo(maxTempo);
        else setTempo(tempo - dec)
    }

    const increaseBeat = () => setBeat((beat + 1) % 10);

    const decreaseBeat = () => setBeat(beat - 1 >= 0 ? beat - 1 : 9);

    document.addEventListener('keyup', () => tapTempo());

    return (
        <div className="metro-buttons">
            {!metOn 
                ? <button className="metronome-button" onClick={() => {setMetOn(true); tap();}} disabled={soundBackOn || tunerOn}>
                    METRONOME ON
                </button>
                : <button className="metronome-button button-on" onClick={() => setMetOn(false)}>
                    METRONOME OFF
                </button>
            }

            <div className='tempo-beat-container' >
                <div className="beat-buttons">
                    <p>BEAT</p>
                    <button id="beatUp" onClick={increaseBeat}>&#9650;</button>
                    <button id="beatDown" onClick={decreaseBeat}>&#9660;</button>
                </div>

                <div className="tempo-buttons">
                    <p>TEMPO</p>
                    <button id="tempoUp" onClick={increaseTempo}>&#9650;</button>
                    <button id="tempoDown" onClick={decreaseTempo}>&#9660;</button>
                </div>
            </div>

            <div className="tap-button-container">
                <p>TAP TEMPO</p>
                <button className="tap-button" onClick={tapTempo}></button>
            </div>
        </div>
    )
}

export default MetroButtons;