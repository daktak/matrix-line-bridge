import {
    middleware,
    MiddlewareConfig,
} from "@line/bot-sdk";

import {
    channelAccessToken,
    channelSecret
} from "../index";

import eventsDispatcher from "./handler";

const middlewareConfig: MiddlewareConfig = {
    channelAccessToken, channelSecret
};

export const expressMapper = (app) => {
    // This route is used for the Webhook.
    app.post(
        "/webhook",
        middleware(middlewareConfig),
        eventsDispatcher
    );
};
