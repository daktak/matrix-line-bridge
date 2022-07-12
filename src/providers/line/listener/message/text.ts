import {
    MessageEvent,
    TextEventMessage,
    TextMessage,
    MessageAPIResponseBase,
} from "@line/bot-sdk";

import {
    Sender,
} from "../../../../sender";

import {
    client as lineClient,
} from "../../index";

import {
    MatrixSender,
    sendTextMessage,
} from "../../../matrix/sender";

import {
    generatePairCode,
    verifyPairCode,
    getSourceIdFromEvent,
} from "../../utils";

import RoomMap from "../../../../models/RoomMap";

type CommandMethod = (
    event: MessageEvent,
    argument: string
) => Promise<MessageAPIResponseBase | undefined>;

type CommandMethodList = {
    [key: string]: CommandMethod
};

const isPushMode = process.env.LINE_SEND_MESSAGE_MODE === "push";

const commands: CommandMethodList = {
    "getChatRoomId": (event: MessageEvent) => {
        const sourceId = getSourceIdFromEvent(event, false) as string;
        console.info(sourceId);
        const replyMessage: TextMessage = {
            type: "text",
            text: sourceId,
        };
        return lineClient.replyMessage(event.replyToken, replyMessage);
    },
    "pair": async (event: MessageEvent, argument: string) => {
        const sourceId = getSourceIdFromEvent(event, false) as string;
        if (await RoomMap.findOne({where: {lineHookFrom: sourceId}})) {
            const replyMessage: TextMessage = {
                type: "text",
                text: "You have already paired.",
            };
            return lineClient.replyMessage(event.replyToken, replyMessage);
        }
        const sender = Sender.system();
        const pairCode = generatePairCode(argument, sourceId);
        const result = await sendTextMessage(
            sender,
            "Hello!\n" +
            "There is a chat room from LINE\n" +
            `(${sourceId}),\n` +
            "hoping to pair with this chat room.\n" +
            "There is the paring-code:\n" +
            pairCode,
            argument,
        );
        const replyMessage: TextMessage = {
            type: "text",
            text: result ? "Pair request sent." : "Pair request failed.",
        };
        return lineClient.replyMessage(event.replyToken, replyMessage);
    },
    "pairConfirm": async (event: MessageEvent, argument: string) => {
        const sourceId = getSourceIdFromEvent(event, false) as string;
        if (await RoomMap.findOne({where: {lineHookFrom: sourceId}})) {
            const replyMessage: TextMessage = {
                type: "text",
                text: "You have already paired.",
            };
            return lineClient.replyMessage(event.replyToken, replyMessage);
        }
        const [matrixRoomId, codeTime, verifyCode] = argument.split("-");
        const codeTimestamp = parseInt(codeTime);
        const result = verifyPairCode(
            matrixRoomId,
            sourceId,
            codeTimestamp,
            verifyCode,
        );
        const replyMessages: Array<TextMessage> = [{
            type: "text",
            text: result ? "Pair request accepted." : "Pair request failed.",
        }];
        const createdTime = Math.round(Date.now() / 1000);
        await RoomMap.create({
            lineMode: isPushMode ? "push" : "notify",
            lineHookFrom: sourceId,
            lineTo: isPushMode ? sourceId : null,
            matrixTo: matrixRoomId,
            createdTime: createdTime,
            updatedTime: createdTime,
        });
        if (!isPushMode) {
            replyMessages.push({
                type: "text",
                text: "Notify mode is dectected.\n" +
                    "Please to pair the Notify Token with command \"#pairNotify\".",
            });
        }
        return lineClient.replyMessage(event.replyToken, replyMessages);
    },
    "pairNotify": async (event: MessageEvent, argument: string) => {
        if (isPushMode) return;
        const sourceId = getSourceIdFromEvent(event, false) as string;
        const roomMap = await RoomMap.findOne({where: {lineHookFrom: sourceId}});
        if (!roomMap) {
            const replyMessage: TextMessage = {
                type: "text",
                text: "You have not paired yet.",
            };
            return lineClient.replyMessage(event.replyToken, replyMessage);
        }
        roomMap.lineTo = argument;
        roomMap.updatedTime = Math.round(Date.now() / 1000);
        await roomMap.save();
        const replyMessage: TextMessage = {
            type: "text",
            text: "Notify Token paired.",
        };
        return lineClient.replyMessage(event.replyToken, replyMessage);
    },
};

// Function handler to receive the text.
export default async (
    event: MessageEvent,
): Promise<MessageAPIResponseBase | undefined> => {
    const message: TextEventMessage = event.message as TextEventMessage;
    const {text} = message;

    if (text.startsWith("#") && text.substring(1).length > 0) {
        const [name, argument] = text.substring(1).split(" ", 2);
        if (name in commands) {
            return await commands[name](event, argument);
        }
    }

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

    sendTextMessage(
        sender,
        text,
        roomMap.matrixTo,
    );
};
