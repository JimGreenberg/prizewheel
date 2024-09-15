import type {Readable } from 'stream'
import './array-util'
import * as fs  from 'fs'
// @ts-ignore
import GIFEncoder from "gifencoder"
import { prizewheel } from "./prizewheel";

const filename = 'test.gif'
const width = 520;
const height = 500;
const FPS = 24;
const encoder = new GIFEncoder(width, height);
encoder.setRepeat(-1);
encoder.setDelay(1000 / FPS);
encoder.setQuality(15);
encoder.setTransparent(0);

fs.createReadStream
const rs: Readable = encoder.createReadStream();
const chunks: Buffer[] = []
rs.on('data', data => {
  chunks.push(data)
})
console.log("starting")
prizewheel(encoder).then(a => {
  const buf = Buffer.concat(chunks)
  console.log(buf.length)
})
