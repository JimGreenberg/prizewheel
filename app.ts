import './array-util'
import dotenv from "dotenv";
dotenv.config();
import { App } from "@slack/bolt";
import { prizewheel } from "./prizewheel";
// import * as fs  from 'fs'
import type {Readable} from 'stream'
// @ts-ignore
import GIFEncoder from "gifencoder"

const BOT_TEST = "C03LZF604RG";

const main = (app: App) => {
  app.command("/spin", async (args) => {
    await args.ack();
    const channel_id = args.body.channel_id;
    const { members } = await app.client.conversations.members({
      channel: channel_id,
    });
    if (!members?.length) throw new Error();

    const { members: users } = await app.client.users.list();
    const user = users?.map((user) => ({
        id: user.id!,
        name: user.profile?.display_name!,
        image: user.profile?.image_48!,
      })).find(({id}) => id === args.body.user_id);
    if (!user) throw new Error();


    await args.say({text: `${user.name} is spinning the prize wheel!`, blocks: [
      {'type':"context",
      elements: [
        {'type': 'image', image_url: user.image, alt_text: user.name},
        {'type': 'mrkdwn', text: `${user.name} is spinning the prize wheel!`}
      ]}
    ]})
    const now = Date.now();
    console.log(now);

    const filename = `pw${now}.gif`

    const width = 520;
    const height = 500;
    const encoder = new GIFEncoder(width, height);
    const rs: Readable = encoder.createReadStream();
    console.log("starting")
    const {winnerText, duration} = await prizewheel(encoder)
    console.log(Date.now() - now)
    const { files }: any = await app.client.files.uploadV2({
      file_uploads: [{filename, file: rs }],
      channel_id
    })
    rs.destroy();

    // console.log(`starting timeout: ${Date.now() - now}`)
    // setTimeout(() => {
    //   args.say({text: `${user.name} spun ${winnerText}!`, blocks: [
    //   {'type':"context",
    //   elements: [
    //     {'type': 'image', image_url: user.image, alt_text: user.name},
    //     {type: 'mrkdwn', text:`${user.name} spun ${winnerText}!`}
    //   ]},
    // ]})
    // console.log(`timeout callback: ${Date.now() - now}`)
    // }, 7000)
    // console.log(`after timeout: ${Date.now() - now}`)
  })
};

const newApp = () =>
  new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
  });

const _app = newApp();
_app.start();
main(_app);
_app.error((e) => {
  console.error(e);
  throw e;
});
