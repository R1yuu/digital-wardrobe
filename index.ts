import Server from './src/Server';
import dotenv from 'dotenv';

dotenv.config();

const port = parseInt(process.env.PORT ?? '4000');

const starter = new Server().checkDbConfiguration().then((server) => server.start(port));

export default starter;