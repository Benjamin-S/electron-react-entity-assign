import router from './routes';
import {poolPromise} from './connect';
import config from './prodconfig';

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const expressApp = express();

const port = 4000;

if (config && !process.env.GH_TOKEN) {
	process.env.GH_TOKEN = config.GH_TOKEN;
}

let server: Server;

expressApp.use(cors());
expressApp.use(bodyParser.json());
expressApp.use('/', router);

server = expressApp.listen(process.env.PORT || port, () => {
	logger.log(`Express server listening on port ${port}`);
});
