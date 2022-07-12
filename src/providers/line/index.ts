import {
    ClientConfig,
    Client,
} from "@line/bot-sdk";

import axios, {
    AxiosInstance,
    AxiosRequestConfig,
} from "axios";

const axiosUserAgent = process.env.DEVICE_NAME || "";

export const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
export const channelSecret = process.env.LINE_CHANNEL_SECRET || "";

// Configure clients
const clientConfig: ClientConfig = {
    channelAccessToken, channelSecret,
};

// Create a new LINE clients.
export const client = new Client(clientConfig);
export const notifyClient = (notifyToken: string): AxiosInstance => {
    const config: AxiosRequestConfig = {
        baseURL: "https://notify-api.line.me",
        headers: {
            "Authorization": `Bearer ${notifyToken}`,
            "User-Agent": axiosUserAgent,
        },
    };
    return axios.create(config);
};
