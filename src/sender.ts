import {
    Sender as LINESender,
} from "@line/bot-sdk";

/**
 * Sender
 */
export class Sender {
    displayName?: string;
    pictureUrl?: string;
    isSystem = false;

    /**
     * Constructor
     * @param {Partial<Sender>} init
     *  {
     *      displayName: string,
     *      pictureUrl: string,
     *      isSystem: boolean,
     *  }
     */
    constructor(init: Partial<Sender>) {
        Object.assign(this, init);
    }

    /**
     * Export as LINE Sender.
     * @return {LINESender}
     */
    toLINE(): LINESender {
        return {
            name: this.displayName,
            iconUrl: this.pictureUrl,
        };
    }

    static system(): Sender {
        const systemName = process.env.DEVICE_NAME || "System";
        return new Sender({
            displayName: systemName,
            isSystem: true,
        });
    }
}
