import * as push from "./push";
import * as notify from "./notify";

import {
    MatrixClient,
    MatrixEvent,
} from "matrix-bot-sdk";

import {
    Sender,
} from "../../../sender";

import {
    MessageAPIResponseBase,
} from "@line/bot-sdk";

import {
    AxiosResponse,
} from "axios";

const client = process.env.LINE_SEND_MESSAGE_MODE === "push" ? push : notify;

export type ImageMessageOptions = {
    thumbnailUrl?: string;
};

export class LineSender extends Sender {
    static async fromMatrixEvent(
        matrixClient: MatrixClient,
        event: MatrixEvent<any>,
    ): Promise<LineSender> {
        const senderProfile =
            await matrixClient.getUserProfile(event.sender);
        const senderIconHttp =
            matrixClient.mxcToHttp(senderProfile.avatar_url);
        return new LineSender({
            displayName: senderProfile.displayname,
            pictureUrl: senderIconHttp,
        });
    }
}

/**
 * Send a text message to the chat room.
 * @param {Sender} sender The sender of the message.
 * @param {string} text The text to send.
 * @param {string} target Chat Room ID or Notify Token.
 * @return {Promise<MessageAPIResponseBase | AxiosResponse>}
 */
export function sendTextMessage(
    sender: Sender,
    text: string,
    target: string,
): Promise<MessageAPIResponseBase | AxiosResponse> {
    return client.sendTextMessage(sender, text, target);
}

/**
 * Send an image message to the chat room.
 * @param {Sender} sender The sender of the message.
 * @param {string} imageUrl URL of the image.
 * @param {string} target Chat Room ID or Notify Token.
 * @param {ImageMessageOptions} options The options to send image message.
 * @return {Promise<MessageAPIResponseBase | AxiosResponse>}
 */
export function sendImageMessage(
    sender: Sender,
    imageUrl: string,
    target: string,
    options: ImageMessageOptions = {},
): Promise<MessageAPIResponseBase | AxiosResponse> {
    return client.sendImageMessage(sender, imageUrl, target, options);
}
