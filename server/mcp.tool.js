import {config} from "dotenv";
import {TwitterApi} from "twitter-api-v2"

config();

const TwitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});


export async function createpost(status) {
    const newpost = await  TwitterClient.v2.tweet(status);

    return {
        content: [
            {
                type: "text",
                text: `Posted tweet with ID: ${status}}`
            }
        ]
    }
}