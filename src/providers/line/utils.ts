import {
    EventBase,
} from "@line/bot-sdk";

import {sha256} from "js-sha256";

function generatePairVerifyCode(
    matrixRoomId: string,
    lineRoomId: string,
    timestamp: number,
): string {
    return sha256([
        matrixRoomId, lineRoomId, timestamp,
    ].join("-")).substring(0, 8);
}

export function generatePairCode(
    matrixRoomId: string,
    lineRoomId: string,
): string {
    const timestamp = Math.round(Date.now() / 1000);
    const verifyCode = generatePairVerifyCode(
        matrixRoomId, lineRoomId, timestamp,
    );
    return `${matrixRoomId}-${timestamp}-${verifyCode}`;
}

export function verifyPairCode(
    matrixRoomId: string,
    lineRoomId: string,
    codeTimestamp: number,
    verifyCode: string,
): boolean {
    const timestamp = Math.round(Date.now() / 1000);
    const expectedVerifyCode = generatePairVerifyCode(
        matrixRoomId, lineRoomId, codeTimestamp,
    );
    const isExpired = timestamp - codeTimestamp > 3_600;
    return expectedVerifyCode === verifyCode && !isExpired;
}

/**
 * Get a sticker image URL from the sticker shop.
 * @param {string} stickerId
 * @return {string}
 */
export function getStickerImageUrl(stickerId: string): string {
    const remoteHostname = "https://stickershop.line-scdn.net";
    const remoteFilename =
        `/stickershop/v1/sticker/${stickerId}/android/sticker.png`;
    return remoteHostname + remoteFilename;
}

/**
 * Get source ID from event.
 * @param {EventBase} event
 * @param {boolean} [withOrigin=false]
 * @return {string | null | undefined | Array<string | null | undefined>}
 */
export function getSourceIdFromEvent(
    event: EventBase,
    withOrigin = false,
): string | null | undefined | Array<string | null | undefined> {
    switch (event.source.type) {
    case "user":
        return withOrigin ?
            [event.source.userId, event.source.userId] :
            event.source.userId;
    case "group":
        return withOrigin ?
            [event.source.groupId, event.source.userId] :
            event.source.groupId;
    case "room":
        return withOrigin ?
            [event.source.roomId, event.source.userId] :
            event.source.roomId;
    default:
        return withOrigin ? [null, null] : null;
    }
}
