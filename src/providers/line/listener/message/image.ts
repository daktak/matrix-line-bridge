import {
    MessageEvent,
    ImageEventMessage,
    MessageAPIResponseBase,
} from "@line/bot-sdk";

import {
    getSourceIdFromEvent,
} from "../../utils";

import {
    MatrixSender,
    sendImageMessage,
    ThumbnailInfo,
    ImageMessageOptions,
} from "../../../matrix/sender";

import {
    client as lineClient,
} from "../../index";

import {
    client as matrixClient,
} from "../../../matrix";

import RoomMap from "../../../../models/RoomMap";

import images, {FILE_TYPE} from "images";
import imageType, {ImageTypeResult} from "image-type";

export default async (
    event: MessageEvent,
): Promise<MessageAPIResponseBase | undefined> => {
    const message: ImageEventMessage = event.message as ImageEventMessage;
    const {id} = message;

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

    const contentStream = await lineClient.getMessageContent(id);
    const contentChunks: Buffer[] = [];
    for await (const chunk of contentStream) {
        contentChunks.push(chunk as never);
    }

    const imageBuffer = Buffer.concat(contentChunks);
    const image = images(imageBuffer);
    const imageSize = image.size();
    const {ext, mime: imageMIME} = imageType(imageBuffer) as ImageTypeResult;

    const thumbnailSize = {
        width: Math.floor(imageSize.width / 2),
        height: Math.floor(imageSize.height / 2),
    };
    const thumbnail = image.copyFromImage(image).resize(
        thumbnailSize.width,
        thumbnailSize.height,
    );
    const thumbnailBuffer: Buffer =
        thumbnail.toBuffer(ext as FILE_TYPE);

    const mxcUrl: string = await matrixClient.uploadContent(imageBuffer);
    const thumbnailMxcUrl: string =
        await matrixClient.uploadContent(thumbnailBuffer);

    const thumbnailInfo: ThumbnailInfo = {
        mimetype: imageMIME,
        size: Buffer.byteLength(thumbnailBuffer),
        width: thumbnailSize.width,
        height: thumbnailSize.height,
    };

    const sendOptions: ImageMessageOptions = {
        mimetype: imageMIME,
        size: Buffer.byteLength(imageBuffer),
        width: imageSize.width,
        height: imageSize.height,
        thumbnailUrl: thumbnailMxcUrl,
        thumbnailInfo,
    };

    sendImageMessage(
        sender,
        mxcUrl,
        roomMap.matrixTo,
        sendOptions,
    );
};
