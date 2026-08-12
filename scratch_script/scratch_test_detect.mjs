import { detectPlatform, extractUrl } from "../src/utils/share.ts";

const input = "《Always Online》@汽水音乐 https://qishui.douyin.com/s/iXJXkjCg/";
console.log("Input:", input);
console.log("Extracted URL:", extractUrl(input));
console.log("Detected Platform:", detectPlatform(input));
