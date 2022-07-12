import "dotenv/config";

import database from "./src/models/init";

import {
    loopEvent as httpServerLoop,
} from "./src/http_server";

import {
    loopEvent as matrixListenerLoop,
} from "./src/providers/matrix/listener";

(async () => {
    await database.sync();
    const events = [
        httpServerLoop,
        matrixListenerLoop,
    ];
    await Promise.all(
        events.map((e) => e()),
    );
})();
