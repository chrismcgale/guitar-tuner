import React, { useEffect, useRef } from 'react';
import '../styles/MetroButtons.scss'

const MetroButtons = ({hand, setHand, tempo, setTempo, beat, setBeat, metronomeOn, setMetronomeOn}) => {
    const minTempo = 30;
    const maxTempo = 252;
    let lastTime = 0;
    const metInterval = useRef(null);

    useEffect(() => {
        if (!metronomeOn) return;

        // then oscilate between left and right
        let rotate = -45;
        metInterval.current = setInterval(() => {
            setHand(rotate);
            rotate *= -1;
            // play sound
            console.log(metronomeOn)
            if (!metronomeOn) clearInterval(metInterval);
        }, (60 / tempo) * 1000);
    }, [metronomeOn]);

    const tap = () => {
        if (metronomeOn) {
            setMetronomeOn(false);
            clearInterval(metInterval.current);
            return setHand(0);
        }
        setMetronomeOn(true);

        // first rotate all the way right
        const currRotation = hand;
        if (currRotation) {
            setHand(-hand);
        }
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
            <button className="metronome-button" onClick={tap}>
                METRONOME ON
            </button>

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