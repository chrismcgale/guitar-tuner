import React, { useEffect, useRef } from 'react';
import Pitchfinder from 'pitchfinder';
import WavDecoder from 'wav-decoder';

import Canvas from './Canvas';
import '../styles/style.scss'


const App = () => {
    const detectPitch = new Pitchfinder.YIN();

    // A0
    const lowestFreq = 27.5;
    // A9
    const highestFreq = 14080;

    let tempo = 60;
    const minTempo = 30;
    const maxTempo = 252;

    const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']



    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let analyserNode = audioCtx.createAnalyser()
    let metronomeOn = false;

    let noteRef = useRef();
    let tempoRef = useRef();
    let handRef = useRef();
    

    const tune = async () => {
        try {
            metronomeOn = false;
            const stream = await navigator.mediaDevices.getUserMedia({audio: true})

            let microphoneStream = audioCtx.createMediaStreamSource(stream);
            microphoneStream.connect(analyserNode);

            let audioData = new Float32Array(analyserNode.fftSize);
            let corrolatedSignal = new Float32Array(analyserNode.fftSize);

            setInterval(() => {
                // component unmounted
                if (!handRef?.target || !noteRef.target) return;
                analyserNode.getFloatTimeDomainData(audioData);

                const sigSounds = audioData.filter((d) => Math.abs(d) > 0.015);
                if (sigSounds.length < 1) return;

                let pitch = detectPitch(WavDecoder.decode(audioData).channelData[0]);
                console.log(pitch)

                if (Number.isNaN(pitch) || pitch < lowestFreq || pitch > highestFreq ) return;

                const relNote = Math.log2(pitch / lowestFreq) * 12;

                const index = Math.round(relNote) % 12;

                const note = noteNames[index];

                let rotate = 45 * (relNote - Math.round(relNote));

                const currRotation = handRef.target.style.transform.match(/rotate\((.+)\)/);

                if (currRotation) {
                    const currDeg = currRotation.slice(1)[0].replace(/deg$/, '');

                    // plus degree because wole metronome is shifted -45deg
                    rotate = Math.abs(rotate + currDeg);
                }

                noteRef.target.innerHTML = `${note}`;

                handRef.target.style.transform = `rotate(${rotate}deg)`;
            }, 600);
        } catch(err) {
            console.log(err);
        };
    }


    const tap = () => {
        if (metronomeOn || !handRef?.target) return;
        metronomeOn = true;
        // first rotate all the way right
        const currRotation = handRef?.target?.style.transform.match(/rotate\((.+)\)/);

        if (currRotation) {
            const currDeg = currRotation.slice(1)[0].replace(/deg$/, '');

            handRef.target.style.transform = `rotate(${ - currDeg}deg)`;
        }

        // then oscilate between left and right
        let rotate = -45;
        const met = setInterval(() => {
            if (!handRef?.target) return;
            handRef.target.style.transform = `rotate(${-45 + rotate}deg)`;
            rotate *= -1;
            // play sound
            if (!metronomeOn) clearInterval(met);
        }, (60 / tempo) * 1000);
    }

    const tapTempo = () => {};


    const increaseTempo = () => {
        if (!handRef?.target || !tempoRef?.target) return;
        const inc = Math.floor(tempo / 20);
        if (tempo + inc > maxTempo) tempo = minTempo;
        else tempo += inc;
        handRef.target.style.transitionDuration = `${60 / tempo}s`;
        tempoRef.target.innerHTML = `${tempo}`;
    }

    const decreaseTempo = () => {
        if (!handRef?.target || !tempoRef?.target) return;
        const dec = Math.floor(tempo / 20);
        if (tempo + dec > minTempo) tempo = maxTempo;
        else tempo -= dec;
        handRef.target.style.transitionDuration = `${60 / tempo}s`;
        tempoRef.target.innerHTML = `${tempo}`;
    }

    const increaseNote = () => {};

    const decreaseNote = () => {};

    const increaseBeat = () => {};

    
    const playNote = () => {};

    const decreaseBeat = () => {};


    const toggleLight = () => {};
    
    return (
    <>
        <div className="calib-buttons">
            <p>CALIB-NOTE</p>
            <button id="noteUp" onClick={increaseNote}>&#9650;</button>
            <button id="noteDown" onClick={decreaseNote}>&#9660;</button>
        </div>

        <div className="sound-container">
            <p>SOUND BACK</p>
            <button id="soundBack" onClick={playNote}>&#9673;</button>
        </div>

        <button id="lightButton" className="light-button" onClick={toggleLight}>&#128161;</button>

        <Canvas noteRef={noteRef} tempoRef={tempoRef} handRef={handRef}/>
        
        <button className="tuner-button" onClick={tune}>
            TUNER ON
        </button>

        <button className="metronome-button" onClick={tap}>
            METRONOME ON
        </button>

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

        <div className="tap-button-container">
            <p>TAP TEMPO</p>
            <button className="tap-button" onClick={tapTempo}></button>
        </div>
    </>
)};

export default App;