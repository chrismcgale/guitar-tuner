
// A0
const lowestFreq = 27.5;
// A9
const highestFreq = 14080;
const noteNames = ['a', 'a#', 'b', 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a']
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyserNode = audioCtx.createAnalyser()
let localMaxima = new Array(10);
const frequencyDisplayElement = document.getElementById('note');
const hand = document.getElementById('hand')

const startPitchDetection = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia ({audio: true})

        let microphoneStream = audioCtx.createMediaStreamSource(stream);
        microphoneStream.connect(analyserNode);

        audioData = new Float32Array(analyserNode.fftSize);
        corrolatedSignal = new Float32Array(analyserNode.fftSize);

        setInterval(() => {
            analyserNode.getFloatTimeDomainData(audioData);

            const sigSounds = audioData.filter((d) => Math.abs(d) > 0.015);
            if (sigSounds.length < 1) return;

            let pitch = getAutocorrolatedPitch();

            if (Number.isNaN(pitch) || pitch < lowestFreq || pitch > highestFreq ) return;

            const index = Math.log2(pitch / lowestFreq) * 12 % 12;

            const note = noteNames[Math.round(index)];

            let rotate = 90 * (index - Math.round(index));

            const currRotation = hand.style.transform.match(/rotate\((.+)\)/);

            if (currRotation) {
                const currDeg = currRotation.slice(1)[0].replace(/deg$/, '');

                const sign = rotate < 0 ? -1 : 1;

                rotate = sign * Math.abs(rotate - currDeg);
            }

            console.log(rotate)


            frequencyDisplayElement.innerHTML = `${note}`;

            hand.style.transform = `rotate(${rotate}deg)`;
        }, 600);
    } catch(err) {
        console.log(err);
    };
}

const getAutocorrolatedPitch = () => {
    // First: autocorrolate the signal

    let maximaCount = 0;

    for (let l = 0; l < analyserNode.fftSize; l++) {
        corrolatedSignal[l] = 0;
        for (let i = 0; i < analyserNode.fftSize - l; i++) {
            corrolatedSignal[l] += audioData[i] * audioData[i + l];
        }
        if (l > 1) {
            if ((corrolatedSignal[l - 2] - corrolatedSignal[l - 1]) < 0
                && (corrolatedSignal[l - 1] - corrolatedSignal[l]) > 0) {
                localMaxima[maximaCount] = (l - 1);
                maximaCount++;
                if ((maximaCount >= localMaxima.length))
                    break;
            }
        }
    }

    // Second: find the average distance in samples between maxima

    let maximaMean = localMaxima[0];

    for (let i = 1; i < maximaCount; i++)
        maximaMean += localMaxima[i] - localMaxima[i - 1];

    maximaMean /= maximaCount;

    return audioCtx.sampleRate / maximaMean;
}

const angle = (dist) => {

}
