import React, { useRef, useEffect } from 'react';
import '../styles/TunerAndSoundButtons.scss'
import noteNames from '../enums/noteNames';
import noteToFreq from '../enums/noteToFreq';

const TunerAndSoundButtons = ({ 
    tunerOn,
    setTunerOn,
    soundBackOn,
    setSoundBackOn,
    metOn,
    note, 
    setNote,
    acceptedA, 
    setAcceptedA, 
    hand, 
    setHand,
}) => {
    const soundBackInt = useRef(null);
    const tuneInt = useRef(null);
    const bufferLength = 2048;
    
    useEffect(() => {
        // These have been set to off and so clear intervals
        if (!soundBackOn) clearInterval(soundBackInt.current);
        if (!tunerOn) clearInterval(tuneInt.current);
    }, [tunerOn, soundBackOn] );

    useEffect(() => {
        if (!soundBackOn) return;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        soundBackInt.current = setInterval(() => {
            let o = audioCtx.createOscillator();
            let g = audioCtx.createGain();
            o.type = 'triangle';
            o.connect(g);
            o.frequency.value = noteToFreq[noteNames[note]];
            g.connect(audioCtx.destination);
            o.start(0);
            g.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1);
        }, 1000)
    }, [soundBackOn, note])

    const rootMeanSquare = (audioData, size) => {
        let sumOfSquares = 0;
        for (let i = 0; i < size; i++) sumOfSquares += audioData[i] ** 2;

        return Math.sqrt(sumOfSquares / size);
    }

    const getCorrolatedFrequency = (audioData) => {
        const size = audioData.length;
        const rms = rootMeanSquare(audioData, size);
        if (rms < 0.01) {
            return -1;
        }

        // Find a range in the buffer where the values are below a given threshold.
        let r1 = 0;
        let r2 = size - 1;
        let threshold = 0.2;

        // Walk up for r1
        for (let i = 0; i < size / 2; i++) {
            if (Math.abs(audioData[i]) < threshold) {
                r1 = i;
                break;
            }
        }

        // Walk down for r2
        for (let i = size - 1; i >= size / 2; i--) {
            if (Math.abs(audioData[i]) < threshold) {
                r2 = i;
                break;
            }
        }

        // Trim the buffer to these ranges and update SIZE.
        const trimmedData = audioData.slice(r1, r2);
        const trimmedSize = trimmedData.length

        // Create a new array of the sums of offsets to do the autocorrelation
        let cds = new Array(bufferLength).fill(0);
        // For each potential offset, calculate the sum of each buffer value times its offset value
        for (let offset = 0; offset < trimmedSize; offset++) {
            for (let j = 0; j < trimmedSize - offset; j++) {
                cds[offset] += trimmedData[j] * trimmedData[j + offset];
            }
        }

        let d = 0;
        while (d < trimmedSize && cds[d] > cds[d + 1]) d++;


       // Iterate from that index through the end and find the maximum sum
       let maxValue = -1;
       let maxIndex = -1;
       for (var i = d; i < trimmedSize; i++) {
           if (cds[i] > maxValue) {
                maxValue = cds[i];
                maxIndex = i;
           }
       }

        let T0 = maxIndex;
        
        // smooth out error
        let y1 = cds[T0 - 1];
        let y2 = cds[T0];
        let y3 = cds[T0 + 1]

        let a = (y1 + y3 - 2 * y2) / 2;
        let b = (y3 - y1) / 2;
        if (a !== 0) T0 -=  b / (2 * a);

        return 2048 / T0;
    }

    const tune = async () => {  
        try {
            let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            let analyserNode = audioCtx.createAnalyser();
            analyserNode.fftSize = bufferLength;
            analyserNode.minDecibels = -100;
            analyserNode.maxDecibels = -10;
            analyserNode.smoothingTimeConstant = 0.85;
            const stream = await navigator.mediaDevices.getUserMedia({audio: true})

            let microphoneStream = audioCtx.createMediaStreamSource(stream);
            microphoneStream.connect(analyserNode);

            let audioData = new Float32Array(bufferLength);

            tuneInt.current = setInterval(() => {
                analyserNode.getFloatTimeDomainData(audioData);

               const pitch = getCorrolatedFrequency(audioData);

               if (pitch < 0) return;

               // c = 440.0(2^-4.75)
                // const c0 = 440.0 * Math.pow(2.0, -4.75);
                // Convert the frequency to a musical pitch.
                const unroundedNote =  12 * (Math.log( pitch / 440 ) /Math.log(2));
                const halfStepsBelowMiddleC = Math.round(unroundedNote) + 69
                const octave = Math.floor(halfStepsBelowMiddleC / 12.0);
                const index = Math.floor(halfStepsBelowMiddleC % 12);
                const key = noteNames[index];

                let rotate = 45 * (unroundedNote  + 69 - halfStepsBelowMiddleC);
                if (hand)  rotate = Math.abs(rotate + hand);

                setNote(index);

                setHand(rotate);
            }, 600);
        } catch(err) {
            console.log(err);
        };
    }

    const increaseNote = () => {
        if (soundBackOn) {
            clearInterval(soundBackInt.current)
            setNote(note < 11 ? note + 1 : 0);
        } else {
            setAcceptedA(acceptedA < 480 ? acceptedA + 1 : 410);
        }
    };

    const decreaseNote = () => {
        if (soundBackOn) {
            clearInterval(soundBackInt.current)
            setNote(note > 0 ? note - 1 : 11);
        } else {
            setAcceptedA(acceptedA > 410 ? acceptedA - 1 : 480);
        }
    };
    
    return (
        <div className="tuner-sound-buttons">
            {!tunerOn 
            ? <button 
                className="tuner-button" 
                onClick={() => {setTunerOn(true); tune();}}
                disabled={soundBackOn || metOn}
            >
                TUNER ON
              </button>
            : <button 
                className="tuner-button button-on" 
                onClick={() => setTunerOn(false) }
            >
                TUNER OFF
              </button>
            }

            <div className="calib-buttons">
                <p>CALIB-NOTE</p>
                <button id="noteUp" onClick={increaseNote}>&#9650;</button>
                <button id="noteDown" onClick={decreaseNote}>&#9660;</button>
            </div>

            <div className="sound-container">
                <p>SOUND BACK</p>
                <button 
                    id="soundBack" 
                    className={soundBackOn ? 'button-on': ''} 
                    disabled={tunerOn || metOn}
                    onClick={() => setSoundBackOn(!soundBackOn)}
                >
                    &#9673;
                </button>
            </div>

        </div>
    );
};

export default TunerAndSoundButtons;