import {
    MessageEvent,
    StickerEventMessage,
    MessageAPIResponseBase,
} from "@line/bot-sdk";

import {
    getStickerImageUrl,
    getSourceIdFromEvent,
} from "../../utils";

import {
    MatrixSender,
    sendImageMessage,
} from "../../../matrix/sender";

import {
    client as lineClient,
} from "../../index";

import {
    client as matrixClient,
} from "../../../matrix";

import RoomMap from "../../../../models/RoomMap";

export default async (
    event: MessageEvent,
): Promise<MessageAPIResponseBase | undefined> => {
    const message: StickerEventMessage = event.message as StickerEventMessage;
    const {stickerId} = message;

    const [sourceId, senderId] =
        getSourceIdFromEvent(event, true) as Array<string>;

    const roomMap = await RoomMap.findOne({
        where: {
            lineHookFrom: sourceId,
            lineMode: process.env.LINE_SEND_MESSAGE_MODE,
        },
    });
    if (!roomMap) return;

    const sender = await MatrixSender.fromLineSource(
        lineClient, sourceId, senderId,
    );

    const sourceImageUrl = getStickerImageUrl(stickerId);
    const mxcUrl: string =
        await matrixClient.uploadContentFromUrl(sourceImageUrl);

    sendImageMessage(
        sender,
        mxcUrl,
        roomMap.matrixTo,
    );
};
