import React, { useEffect } from 'react';
import Pitchfinder from 'pitchfinder';
import WavDecoder from 'wav-decoder';
import '../styles/TunerAndSoundButtons.scss'
import noteNames from '../enums/noteNames';

const TunerAndSoundButtons = ({ note, setNote, acceptedA, setAcceptedA, setMetronomeOn, hand, setHand }) => {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let analyserNode = audioCtx.createAnalyser()
    
    const bufferLength = 2048;
    analyserNode.fftSize = bufferLength;
    let soundBackOn = false;


    // Get mic access
    useEffect(() => {

    }, [])

    const getCorrolatedFrequency = (audioData) => {
        var SIZE = audioData.length;
  var sumOfSquares = 0;
  for (var i = 0; i < SIZE; i++) {
    var val = audioData[i];
    sumOfSquares += val * val;
  }
  var rootMeanSquare = Math.sqrt(sumOfSquares / SIZE)
  if (rootMeanSquare < 0.01) {
    return -1;
  }

  // Find a range in the buffer where the values are below a given threshold.
  var r1 = 0;
  var r2 = SIZE - 1;
  var threshold = 0.2;

  // Walk up for r1
  for (var i = 0; i < SIZE / 2; i++) {
    if (Math.abs(audioData[i]) < threshold) {
      r1 = i;
      break;
    }
  }

  // Walk down for r2
  for (var i = 1; i < SIZE / 2; i++) {
    if (Math.abs(audioData[SIZE - i]) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }

  // Trim the buffer to these ranges and update SIZE.
  audioData = audioData.slice(r1, r2);
  SIZE = audioData.length

  var cds = new Array(SIZE).fill(0);

        // Create a new array of the sums of offsets to do the autocorrelation
        var offsetSums = new Array(bufferLength).fill(0);
        // For each potential offset, calculate the sum of each buffer value times its offset value
        for (let offset = 0; offset < SIZE; offset++) {
            for (let j = 0; j < SIZE - offset; j++) {
                cds[offset] = cds[offset] + audioData[j] * audioData[j+offset]
            }
        }

        var d = 0;
        while (d < SIZE && cds[d] > cds[d+1]) {
          d++;
        }

        // Iterate from that index through the end and find the maximum sum
        var maxValue = -1;
        var maxIndex = -1;
        for (var i = d; i < SIZE; i++) {
            if (cds[i] > maxValue) {
            maxValue = cds[i];
            maxIndex = i;
            }
        }

        var T0 = maxIndex;
        
        var x1 = cds[T0 - 1];
        var x2 = cds[T0];
        var x3 = cds[T0 + 1]

        var a = (x1 + x3 - 2 * x2) / 2;
        var b = (x3 - x1) / 2
        if (a) {
            T0 = T0 - b / (2 * a);
        }

        // Once we have the best offset for the repetition, we can calculate the frequency from the sampleRate
        const pitch = audioCtx.sampleRate / cds[T0]

        console.log( cds[T0])

        return pitch;
    }

    const tune = async () => {
        try {
            setMetronomeOn(false)
            const stream = await navigator.mediaDevices.getUserMedia({audio: true})

            let microphoneStream = audioCtx.createMediaStreamSource(stream);
            microphoneStream.connect(analyserNode);

            let audioData = new Uint8Array(bufferLength);

            setInterval(() => {
                // component unmounted
                analyserNode.getByteTimeDomainData(audioData);

               const pitch = getCorrolatedFrequency(audioData);

                const relNote = Math.log2(pitch / lowestFreq) * 12;

                const index = Math.round(relNote) % 12;

                const key = noteNames[index];

                let rotate = 45 * (relNote - Math.round(relNote));
                if (hand)  rotate = Math.abs(rotate + hand);

                setNote(key);

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