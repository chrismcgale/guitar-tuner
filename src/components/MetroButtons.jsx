import React from 'react';
import '../styles/MetroButtons.scss'

const MetroButtons = ({hand, setHand, tempo, setTempo, beat, setBeat}) => {

    const minTempo = 30;
    const maxTempo = 252;

    let met;


    const tap = () => {
        if (metronomeOn) {
            metronomeOn = false;
            return clearInterval(met);
        }
        metronomeOn = true;

        // first rotate all the way right
        const currRotation = hand;
        if (currRotation) {
            setHand(-hand);
        }

        // then oscilate between left and right
        let rotate = -45;
        met = setInterval(() => {
            setHand(rotate);
            rotate *= -1;
            // play sound
            if (!metronomeOn) clearInterval(met);
        }, (60 / tempo) * 1000);
    }

    const tapTempo = () => {};


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


    const increaseBeat = () => {
        setBeat((beat + 1) % 10);
    };

    const decreaseBeat = () => {
        setBeat(beat - 1 >= 0 ? beat - 1 : 9);
    };

    
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