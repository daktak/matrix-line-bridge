import {
    MessageEvent,
    FileMessageEventContent,
} from "matrix-bot-sdk";

import {
    MatrixListenerClient,
} from "../client";

import {
    LineSender,
    sendImageMessage,
    ImageMessageOptions,
} from "../../../line/sender";

import RoomMap from "../../../../models/RoomMap";

export default async (
    listenerClient: MatrixListenerClient,
    roomId: string,
    event: MessageEvent<any>,
): Promise<undefined> => {
    const messageEvent = new MessageEvent<FileMessageEventContent>(event.raw);

    const roomMap = await RoomMap.findOne({
        where: {
            matrixTo: roomId,
            lineMode: process.env.LINE_SEND_MESSAGE_MODE,
        },
    });
    if (!roomMap) return;

    const sender = await LineSender.fromMatrixEvent(
        listenerClient, event,
    );

    const mxcUrl = messageEvent.content.url;
    const thumbnailMxcUrl =
        messageEvent.content.info?.thumbnail_url || messageEvent.content.url;

    const httpUrl = listenerClient.mxcToHttp(mxcUrl);
    const thumbnailHttpUrl = listenerClient.mxcToHttp(thumbnailMxcUrl);

    const sendOptions: ImageMessageOptions = {
        thumbnailUrl: thumbnailHttpUrl,
    };

    if (!roomMap.lineTo) {
        console.error("lineTo is not set");
        return;
    }

    sendImageMessage(
        sender,
        httpUrl,
        roomMap.lineTo as string,
        sendOptions,
    );
};
