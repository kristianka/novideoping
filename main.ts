import open from "open";
import { DataResponse } from "./types";

let wait = 10000; // 10 seconds, you may get IP banned if you set this too low
let firstRun = true;
const sku = "PRO580GFTNV";
const locale = "fi-fi";
const url = `https://api.store.nvidia.com/partner/v1/feinventory?skus=${sku}&locale=${locale}`;

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
