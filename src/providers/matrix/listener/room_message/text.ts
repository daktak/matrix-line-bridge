import {
    MessageEvent,
} from "matrix-bot-sdk";

import {
    Sender,
} from "../../../../sender";

import {
    MatrixListenerClient,
} from "../client";

import {
    sendTextMessage as replyMessagePrototype,
} from "../../sender";

import {
    LineSender,
    sendTextMessage,
} from "../../../line/sender";

import RoomMap from "../../../../models/RoomMap";

const replyMessage = (roomId: string, message: string) => {
    const sender = Sender.system();
    return replyMessagePrototype(
        sender, message, roomId,
    );
};

type CommandMethod = (
    roomId: string,
    event: MessageEvent<any>,
    argument: string
) => Promise<void | undefined> | void | undefined;

type CommandMethodList = {
    [key: string]: CommandMethod
};

const commands: CommandMethodList = {
    "getChatRoomId": (roomId: string) => {
        console.info(roomId);
        replyMessage(roomId, roomId);
    },
};

export default async (
    listenerClient: MatrixListenerClient,
    roomId: string,
    event: MessageEvent<any>,
): Promise<undefined> => {
    const messageEvent = event;

    const text = messageEvent.textBody;
    if (text.startsWith("#") && text.substring(1).length > 0) {
        const [name, argument] = text.substring(1).split(" ", 2);
        if (name in commands) {
            await commands[name](roomId, messageEvent, argument);
            return;
        }
    }

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

    if (!roomMap.lineTo) {
        console.error("lineTo is not set");
        return;
    }

    sendTextMessage(
        sender,
        text,
        roomMap.lineTo as string,
    );
};
