import {
    Client as LineClient,
    WebhookEvent as LineWebhookEvent,
} from "@line/bot-sdk";

import {
    getSourceIdFromEvent,
} from "../line/utils";

import {
    Sender,
} from "../../sender";

import {
    client,
} from "./index";

export class MatrixSender extends Sender {
    static async fromLineSource(
        lineClient: LineClient,
        sourceId: string,
        senderId: string,
    ): Promise<MatrixSender> {
        const profile =
            await lineClient.getGroupMemberProfile(sourceId, senderId);
        return new MatrixSender(profile);
    }

    static async fromLineEvent(
        lineClient: LineClient,
        event: LineWebhookEvent,
    ): Promise<MatrixSender> {
        const [sourceId, senderId] =
            getSourceIdFromEvent(event, true) as Array<string>;
        const profile =
            await lineClient.getGroupMemberProfile(sourceId, senderId);
        return new MatrixSender(profile);
    }
}

export type ThumbnailInfo = {
    mimetype?: string;
    size?: number;
    width?: number;
    height?: number;
};

export type ImageMessageOptions = {
    mimetype?: string;
    size?: number;
    width?: number;
    height?: number;
    thumbnailUrl?: string;
    thumbnailInfo?: ThumbnailInfo;
};

/**
 * Send a text message to the chat room.
 * @param {Sender} sender The sender of the message.
 * @param {string} text The text to send.
 * @param {string} roomId ID of the chat room.
 * @return {Promise<string>}
 */
export function sendTextMessage(
    sender: MatrixSender,
    text: string,
    roomId: string,
): Promise<string> {
    /** if roomId is null
     *  roomId = client.RoomCreate({invite: [MATRIX_USER], name: ${sender.chatRoomName}
     *  roomMapCreate -- update
     */
    const prefix = sender.isSystem ? "⬥" : "⬦";
    return client.sendMessage(roomId, {
        "msgtype": "m.text",
        "body": `${prefix}${sender.displayName}:\n${text}`,
    });
}

/**
 * Send an image message to the chat room.
 * @param {Sender} sender The sender of the message.
 * @param {string} imageUrl URL of the image.
 * @param {string} roomId ID of the chat room.
 * @param {ImageMessageOptions} options The options to send image message.
 * @return {Promise<string>}
 */
export function sendImageMessage(
    sender: MatrixSender,
    imageUrl: string,
    roomId: string,
    options: ImageMessageOptions = {},
): Promise<string> {
    const prefix = sender.isSystem ? "⬥" : "⬦";
    (async () => sendTextMessage(sender, "Image:", roomId))();
    return client.sendMessage(roomId, {
        "msgtype": "m.image",
        "url": imageUrl,
        "body": `${prefix}${sender.displayName}: Image:`,
        "info": {
            "mimetype": options.mimetype,
            "size": options.size,
            "w": options.width,
            "h": options.height,
            "thumbnail_url": options.thumbnailUrl || imageUrl,
            "thumbnail_info": options.thumbnailInfo,
        },
    });
}
