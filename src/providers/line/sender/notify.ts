import {
    Sender,
} from "../../../sender";

import {
    AxiosResponse,
} from "axios";

import {
    notifyClient,
} from "../index";

import {
    ImageMessageOptions,
} from "./index";

import {
    stringify,
} from "querystring";

type Message = {
    message: string;
    imageThumbnail?: string;
    imageFullsize?: string;
    imageFile?: string;
    stickerPackageId?: number;
    stickerId?: number;
    notificationDisabled?: boolean;
};

const sendMessage =
    (notifyToken: string, message: Message): Promise<AxiosResponse> =>
        notifyClient(notifyToken).post("/api/notify", stringify(message));

/**
 * Send a text message to the chat room.
 * @param {Sender} sender The sender of the message.
 * @param {string} text The text to send.
 * @param {string} notifyToken The notify token to the chat room.
 * @return {Promise<AxiosResponse>}
 */
export function sendTextMessage(
    sender: Sender,
    text: string,
    notifyToken: string,
): Promise<AxiosResponse> {
    const prefix = sender.isSystem ? "⬥" : "⬦";
    const message: Message = {
        message: `${prefix}${sender.displayName}:\n${text}`,
    };
    return sendMessage(notifyToken, message);
}

/**
 * Send an image message to the chat room.
 * @param {Sender} sender The sender of the message.
 * @param {string} imageUrl URL of the image.
 * @param {string} notifyToken The notify token to the chat room.
 * @param {ImageMessageOptions} options The options to send image message.
 * @return {Promise<AxiosResponse>}
 */
export function sendImageMessage(
    sender: Sender,
    imageUrl: string,
    notifyToken: string,
    options: ImageMessageOptions = {},
): Promise<AxiosResponse> {
    const prefix = sender.isSystem ? "⬥" : "⬦";
    const message: Message = {
        message: `${prefix}${sender.displayName}: Image:`,
        imageFullsize: imageUrl,
        imageThumbnail: options.thumbnailUrl || imageUrl,
    };
    return sendMessage(notifyToken, message);
}
