// Set up the canvas
const canvas = document.getElementById('metronome');
const ctx = canvas.getContext('2d');

const radius = 100;
const length = canvas.height - 10;

const setUp = () => {
    console.log("SETUP")
    // Draw tuner arc
    ctx.beginPath();
    // we want angles 315 - 45 clockwise
    ctx.arc(canvas.width / 2, canvas.height , radius, 7 * Math.PI / 4, 5 *  Math.PI / 4, true);
    ctx.stroke();

    // draw hand
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.height, length);
    ctx.stroke();

    // draw thin guiding lines
}

setUp();


