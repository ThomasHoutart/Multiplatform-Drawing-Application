import socketIO from 'socket.io';
import { DatabaseController } from './database/DatabaseController';
import { List } from './List';
import { App } from './server'
const port: number = Number(process.env.PORT) || 3000;
const isProduction = new List(process.argv).has('true');
const db = new DatabaseController(isProduction);
const app = new App<socketIO.Socket, socketIO.Server>(port, db);
db.init().then(() => {
    app.init().then(() => {
        app.start();
    }).catch((e) => {
        (console).log(e);
    });
}).catch((e) => {
    (console).log(e);
});
