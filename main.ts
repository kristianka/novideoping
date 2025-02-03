import open from "open";
import { DataResponse } from "./types";
import { askQuestion, rl } from "./helpers";

let wait = 10000; // 10 seconds, you may get IP banned if you set this too low
let firstRun = true;
let sku = "PRO580GFTNV";
let locale = "fi-fi";
const url = `https://api.store.nvidia.com/partner/v1/feinventory?skus=${sku}&locale=${locale}`;

const skuToGpuNameMap: { [key: string]: string } = {
    PRO580GFTNV: "RTX 5080",
    PRO590GFTNV: "RTX 5090"
};

const main = async () => {
    let oldData: DataResponse = {
        success: false,
        map: {},
        listMap: [
            {
                is_active: false,
                product_url: "",
                price: "",
                fe_sku: "",
                locale: ""
            }
        ]
    };

    // ask which to track
    try {
        console.log("\n👋 Welcome to the Nvidia GPU tracker!");
        console.log(
            "❓ This script will track the availability of the RTX 5080 FE or RTX 5090 FE on the Nvidia store."
        );
        console.log(
            "🌍 A browser window will open when the product is in stock. Be ready to buy! 🚀"
        );
        console.log(
            "😩 Please note that this script may fail if Nvidia changes their API and SKUs (like they have!). The API can throw some errors, which usually means you are being ratelimited. In that case, you should increase the wait time between requests."
        );
        console.log(
            "❕I recommended checking the GitHub repository once in a while to see if the SKUs have changed: https://github.com/kristianka/novideoping"
        );
        console.log("\nPlease answer the following questions to start tracking. Good luck! 🍀");
        const answer1 = await askQuestion(
            "Do you want to track the RTX 5080 FE or the RTX 5090 FE? \n 1. RTX 5080 \n 2. RTX 5090 \n"
        );

        if (answer1 === "1") {
            sku = "PRO580GFTNV";
        } else if (answer1 === "2") {
            sku = "PRO590GFTNV";
        } else {
            console.log("Invalid input. Please restart and enter 1 or 2.");
            rl.close();
            return;
        }

        const answer2 = await askQuestion(
            "How often do you want to check for changes? (in seconds). Under 10 is not recommended to avoid IP bans!\n"
        );

        const parsedWait = parseInt(answer2) * 1000;
        if (!isNaN(parsedWait) && parsedWait >= 10000) {
            wait = parsedWait;
        } else {
            console.log("Invalid input. Using default value: 10 seconds.");
        }

        const answer3 = await askQuestion(
            "Which locale do you want to track? (e.g. fi-fi, nl-nl, de-de)\n"
        );

        locale = answer3;

        console.log(
            `Tracking ${skuToGpuNameMap[sku]} from ${locale} every ${wait / 1000} seconds.`
        );
        console.log(`´\nPlease make sure the generated URL is correct: ${url}`);
        rl.close();
    } catch (error) {
        console.error("An error occurred while asking for input:", error);
        rl.close();
        throw new Error("Stopping script...");
    }

    setInterval(async () => {
        try {
            const res = await fetch(url);
            const data: DataResponse = await res.json();
            const now = new Date().toLocaleTimeString();

            if (JSON.stringify(data) !== JSON.stringify(oldData)) {
                // don't open browser on first run
                if (firstRun) {
                    firstRun = false;
                    console.log(now + " - First run. Waiting for changes...");
                    oldData = data;
                    return;
                }

                console.log(data);
                console.log(now + " - 🚀✅ DATA CHANGED! 🚀");
                oldData = data;

                // open browser
                const url = data.listMap[0].product_url
                    ? data.listMap[0].product_url
                    : `https://marketplace.nvidia.com/${locale}/consumer/graphics-cards/`;
                await open(url);

                throw new Error("Stopping script...");
            } else {
                console.log(
                    now + " - 🔄️ No changes in data. Retrying in " + wait / 1000 + " seconds..."
                );
            }
        } catch (error) {
            const now = new Date().toLocaleTimeString();
            console.log(now + " - ⚠️ UNABLE TO FETCH DATA! ⚠️");
            console.log(error);
        }
    }, wait);
};

main();
