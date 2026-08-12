import { identifyPlatform } from "../src/lib/platforms.ts";
import { detectPlatform } from "../src/utils/share.ts";

const url = "https://qishui.douyin.com/s/iXJXkjCg/";
console.log("identifyPlatform result:", identifyPlatform(url));
console.log("detectPlatform result:", detectPlatform(url));
