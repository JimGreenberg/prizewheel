const env = require('dotenv')
import { COPY } from './copy'

const fs = require('fs')
const GIFEncoder = require("gifencoder");
const { createCanvas } = require("canvas");

const FILENAME = "test.gif"

const _2Pi = 2 * Math.PI
const width = 520;
const height = 500;
const FPS = 24;
const DURATION_MIN = 2;
const DURATION_MAX = 4
let DURATION = Math.random() * (DURATION_MAX - DURATION_MIN) + DURATION_MIN

const copy = COPY.shuffle();

const colors = ["#309bff", "#f95da7", "#bae84a", "#fffd51", "#ffbf20"];

const segments = copy.map((text, i) => ({
  text,
  color: colors[i % colors.length],
}));
if (segments[0].color === segments[segments.length - 1].color) {
  segments[0].color = colors[Math.floor(colors.length / 2)];
}

// const encoder = new GIFEncoder(width, height);
// encoder.createReadStream().pipe(fs.createWriteStream(FILENAME));
// encoder.start();
// encoder.setRepeat(-1);
// encoder.setDelay(1000 / FPS);
// encoder.setQuality(15);
// encoder.setTransparent(0);

function getWinner(offset: number) {
  // a semisegment is half a segment, divided at the midpoint
  // so there are 2n semisegments ranging from 0 to 2n-1
  // at 0 offset, we fall on the last item in copy - this is just a result of how we're drawing the wheel
  const semiSegment = Math.floor(2 * segments.length * offset / _2Pi)
  // normalize our segmiSegment to match the ordering of copy
  const shiftedSemiSegment = (semiSegment - 1 + (2 * segments.length)) % (2 * segments.length)
  // since there are 2 semiSegments per segment, and our copy is per segment, divide by 2
  const segment = Math.floor(shiftedSemiSegment / 2)
  // we're spinning in the opposite direction of the ordering of the list, so reverse our found segment
  const winnerIdx = (2 * segments.length - segment - 2) % segments.length
  return segments[winnerIdx].text
}

function draw(ctx: any, offset: number) {
  const normalizedOffset = offset % _2Pi
  ctx.restore();
  ctx.save();
  ctx.translate(250, 250);
  ctx.clearRect(-250, -250, 520, 520);
  ctx.rotate(normalizedOffset);
  segments.forEach(({text, color}) => {
    ctx.rotate(_2Pi / segments.length / 2)
    ctx.beginPath();
    ctx.arc(0, 0, 250, 0, _2Pi / segments.length);
    ctx.lineTo(0, 0);
    ctx.closePath();

    ctx.fillStyle = color
    ctx.fill();
    ctx.fill();
    ctx.rotate(_2Pi / segments.length / 2)
    ctx.fillStyle = "black";
    ctx.font = "18px serif";
    ctx.textAlign = "right";
    ctx.fillText(text, 245, 5);
  });
  ctx.resetTransform();
  ctx.beginPath()
  ctx.moveTo(505,250)
  ctx.lineTo(520,260)
  ctx.lineTo(520,240)
  ctx.lineTo(505,250)
  ctx.closePath()
  ctx.fillStyle = 'red'
  ctx.fill();

  return ctx;
}

export async function prizewheel(encoder: any) {
  encoder.setRepeat(-1);
  encoder.setDelay(1000 / FPS);
  encoder.setQuality(15);
  encoder.setTransparent(0);

  const canvas = createCanvas(width, height)
  let ctx = canvas.getContext("2d");

  const initialOffset = (Math.random() * _2Pi) % _2Pi
  let offset = initialOffset;

  // RPS = rotations per second
  /** we need a minimum since some algorithms asymptotically approach zero */
  const MIN_RPS = 0.0075
  const initialRps = Math.random() + 2 // between 2 and 3

  // DURATION = 1 // debug

  function linear(...args: any) {
    return initialRps / (FPS * DURATION)
  }

  const getTorque = [linear].sample();


  let rps = initialRps;
  encoder.start();
  for (let frame = 0; frame < DURATION * FPS; frame++) {
    rps -= getTorque(frame);
    rps = Math.max(rps, MIN_RPS)
    const dTheta = _2Pi * rps / FPS
    offset = offset + dTheta
    encoder.addFrame(draw(ctx, offset));
  }
  encoder.finish();
  const winnerText = getWinner(offset);
  console.log(winnerText);
  return {winnerText, duration: DURATION}
}
