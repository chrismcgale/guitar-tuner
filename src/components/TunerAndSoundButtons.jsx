import React, { useEffect } from 'react';
import Pitchfinder from 'pitchfinder';
import WavDecoder from 'wav-decoder';
import '../styles/TunerAndSoundButtons.scss'

const TunerAndSoundButtons = ({ note, setNote, acceptedA, setAcceptedA }) => {

    const detectPitch = new Pitchfinder.YIN();

    // A0
    const lowestFreq = 27.5;
    // A9
    const highestFreq = 14080;
    
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let analyserNode = audioCtx.createAnalyser()
    let metronomeOn = false;
    let soundBackOn = false;


    // Get mic access
    useEffect(() => {

    }, [])

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

    const increaseNote = () => {
        if (soundBackOn) {
            setNote(note + 1);
        } else {
            setAcceptedA(acceptedA < 480 ? acceptedA + 1 : 410);
        }
    };

    const decreaseNote = () => {
        if (soundBackOn) {
            setNote(note - 1 >= 0 ? note - 1 : 12);
        } else {
            setAcceptedA(acceptedA > 410 ? acceptedA - 1 : 480);
        }
    };

    const soundBack = () => soundBackOn = !soundBackOn;

    const toggleLight = () => {};
    
    return (
        <div className="tuner-sound-buttons">
            <button className="tuner-button" onClick={tune}>
                TUNER ON
            </button>

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

        </div>
    );
};

export default TunerAndSoundButtons;