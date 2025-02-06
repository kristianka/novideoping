import open from "open";
import { DataResponse, SkuDataResponse } from "./types";
import { askQuestion, rl } from "./helpers";

let wait = 10000; // 10 seconds, you may get IP banned if you set this too low
let firstRun = true;
let sku = "5080";
let locale = "fi-fi";

let url = "";
const main = async () => {
    let oldData;

    // ask which to track
    try {
        console.log("\n👋 Welcome to the Nvidia GPU tracker!");
        console.log("❓ This script will track the SKU changes in NVIDIA API.");

        sku = await askQuestion("Do you want to track the RTX 5080 FE or the 5090 FE?\n");

        const answer2 = await askQuestion(
            "How often do you want to check for changes? (in seconds). Under 10 is not recommended to avoid IP bans!\n"
        );

        const parsedWait = parseInt(answer2) * 1000;
        if (!isNaN(parsedWait) && parsedWait >= 5000) {
            wait = parsedWait;
        } else {
            console.log("Invalid input. Using default value: 10 seconds.");
        }

        const answer3 = await askQuestion(
            "Which locale do you want to track? (e.g. fi-fi, nl-nl, de-de)\n"
        );

        locale = answer3;
        url = `https://api.nvidia.partners/edge/product/search?page=1&limit=12&locale=${locale}&gpu=RTX%20${sku}&gpu_filter=RTX%205090~1,RTX%20${sku}~1&category=GPU`;

        console.log(`Tracking ${sku} SKU changes from ${locale} every ${wait / 1000} seconds...`);
        console.log(`\nPlease make sure the generated URL is correct: ${url}\n`);
        rl.close();
    } catch (error) {
        console.error("An error occurred while asking for input:", error);
        rl.close();
        throw new Error("Stopping script...");
    }

    setInterval(async () => {
        try {
            const res = await fetch(url);
            const data: SkuDataResponse = await res.json();
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
                const url = data.searchedProducts.productDetails[0].internalLink
                    ? data.searchedProducts.productDetails[0].internalLink
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
