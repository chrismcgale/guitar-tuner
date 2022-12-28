const Pitchfinder = require('pitchfinder');
const WavDecoder = require('wav-decoder');

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
const noteDisplay = document.getElementById('note');
const tempoDisplay = document.getElementById('tempo');
const hand = document.getElementById('hand')

window.tune = async () => {
    try {
        metronomeOn = false;
        const stream = await navigator.mediaDevices.getUserMedia({audio: true})

        let microphoneStream = audioCtx.createMediaStreamSource(stream);
        microphoneStream.connect(analyserNode);

        audioData = new Float32Array(analyserNode.fftSize);
        corrolatedSignal = new Float32Array(analyserNode.fftSize);

        setInterval(() => {
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

            const currRotation = hand.style.transform.match(/rotate\((.+)\)/);

            if (currRotation) {
                const currDeg = currRotation.slice(1)[0].replace(/deg$/, '');

                // plus degree because wole metronome is shifted -45deg
                rotate = Math.abs(rotate + currDeg);
            }

            noteDisplay.innerHTML = `${note}`;

            hand.style.transform = `rotate(${rotate}deg)`;
        }, 600);
    } catch(err) {
        console.log(err);
    };
}


const tap = () => {
    if (metronomeOn) return;
    metronomeOn = true;
    // first rotate all the way right
    const currRotation = hand.style.transform.match(/rotate\((.+)\)/);

    if (currRotation) {
        const currDeg = currRotation.slice(1)[0].replace(/deg$/, '');

        hand.style.transform = `rotate(${ - currDeg}deg)`;
    }

    // then oscilate between left and right
    let rotate = -45;
    const met = setInterval(() => {
        hand.style.transform = `rotate(${-45 + rotate}deg)`;
        rotate *= -1;
        // play sound
        if (!metronomeOn) clearInterval(met);
    }, (60 / tempo) * 1000);
}


const increaseTempo = () => {
    const inc = Math.floor(tempo / 20);
    if (tempo + inc > maxTempo) tempo = minTempo;
    else tempo += inc;
    hand.style.transitionDuration = `${60 / tempo}s`;
    tempoDisplay.innerHTML = `${tempo}`;
}

const decreaseTempo = () => {
    const dec = Math.floor(tempo / 20);
    if (tempo + dec > minTempo) tempo = maxTempo;
    else tempo -= dec;
    hand.style.transitionDuration = `${60 / tempo}s`;
    tempoDisplay.innerHTML = `${tempo}`;
}


const playNote = () => {

}

const toggleLight = () => {

}

module.exports = {
    tune,
    tap
}