import { Router, Request, Response } from 'express';
import NodeMediaServer from 'node-media-server';

// Create an Express Router for handling the RTMP stream
const router = Router();

// Define your RTMP server configuration
const config = {
  rtmp: {
    port: 1935, // Port for RTMP (default is 1935)
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_interval: 30
  },
  http: {
    port: 8000, // HTTP server for monitoring
    mediaroot: './media',
    webroot: './www'
  },
  trans: {
    ffmpeg: '/usr/local/bin/ffmpeg', // Path to ffmpeg (make sure it's installed)
    tasks: []
  }
};

// Set up the RTMP server
const nms = new NodeMediaServer(config);
nms.run();

// Route to serve RTMP stream URL
router.get('/stream/:streamId/rtmp', (req: Request, res: Response) => {
    const { streamId } = req.params;

    // Build the RTMP URL based on the stream ID
    const rtmpUrl = `rtmp://localhost:1935/live/${streamId}`;

    // Respond with the RTMP URL for the client to stream to
    res.json({ rtmpUrl });
});

export { router };
