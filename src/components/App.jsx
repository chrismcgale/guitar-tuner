import React, { useEffect, useState } from 'react';
import Pitchfinder from 'pitchfinder';
import WavDecoder from 'wav-decoder';

import Canvas from './Canvas';
import noteNames from '../enums/noteNames';
import '../styles/style.scss'


const App = () => {
    const detectPitch = new Pitchfinder.YIN();

    // A0
    const lowestFreq = 27.5;
    // A9
    const highestFreq = 14080;

    const minTempo = 30;
    const maxTempo = 252;

    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let analyserNode = audioCtx.createAnalyser()
    let metronomeOn = false;

    const [note, setNote] = useState(0);
    const [tempo, setTempo] = useState(60);
    const [beat, setBeat] = useState(0);
    const [hand, setHand] = useState(0);

    let soundBackOn = false;
    let met;
    

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
                analyserNode.getFloatTimeDomainData(audioData);

                const sigSounds = audioData.filter((d) => Math.abs(d) > 0.015);
                if (sigSounds.length < 1) return;

                let pitch = detectPitch(WavDecoder.decode(audioData).channelData[0]);
                console.log(pitch)

                if (Number.isNaN(pitch) || pitch < lowestFreq || pitch > highestFreq ) return;

                const relNote = Math.log2(pitch / lowestFreq) * 12;

                const index = Math.round(relNote) % 12;

                let rotate = 45 * (relNote - Math.round(relNote));

                const currRotation = hand;

                if (currRotation) {
                    const currDeg = currRotation.slice(1)[0].replace(/deg$/, '');

                    // plus degree because wole metronome is shifted -45deg
                    rotate = Math.abs(rotate + currDeg);
                }

                setNote(index);

                setHand(rotate);
            }, 600);
        } catch(err) {
            console.log(err);
        };
    }


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

    const increaseNote = () => {
        console.log(soundBackOn)
        if (soundBackOn) {
            setNote(note + 1);
        } else {
            
        }
    };

    const decreaseNote = () => {
        if (soundBackOn) {
            console.log((note - 1) % 12)
            setNote(note - 1 >= 0 ? note - 1 : 12);
        } else {

        }
    };

    const increaseBeat = () => {
        setBeat((beat + 1) % 10);
    };

    const decreaseBeat = () => {
        setBeat(beat - 1 >= 0 ? beat - 1 : 9);
    };

    const soundBack = () => soundBackOn = !soundBackOn;

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
            <button id="soundBack" onClick={soundBack}>&#9673;</button>
        </div>

        <button id="lightButton" className="light-button" onClick={toggleLight}>&#128161;</button>

        <Canvas note={note} tempo={tempo} beat={beat} hand={hand}/>
        
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