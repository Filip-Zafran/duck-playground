import express from 'express';
import sharp from 'sharp';

const router = express.Router();

// Generate countdown image
router.get('/countdown', async (req, res) => {
  try {
    const { deadline, title, eventName } = req.query;

    if (!deadline) {
      return res.status(400).json({ error: 'deadline parameter required' });
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

    const width = 1200;
    const height = 630;

    // Create SVG for the countdown
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0066ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e50051;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad1)"/>
        <text x="${width / 2}" y="150" font-size="48" font-weight="bold" fill="white" text-anchor="middle">
          ${eventName || 'Duck Dating Apps'}
        </text>
        <text x="${width / 2}" y="250" font-size="72" font-weight="900" fill="white" text-anchor="middle">
          ${daysLeft}
        </text>
        <text x="${width / 2}" y="330" font-size="36" fill="white" text-anchor="middle">
          ${daysLeft === 1 ? 'day' : 'days'} to apply
        </text>
        <text x="${width / 2}" y="550" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle">
          ${deadlineDate.toLocaleDateString()}
        </text>
      </svg>
    `;

    // Convert SVG to PNG using Sharp
    const image = await sharp(Buffer.from(svg))
      .png({ quality: 80 })
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(image);
  } catch (error) {
    console.error('Error generating countdown image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Generate event poster
router.get('/poster', async (req, res) => {
  try {
    const { title, date, location } = req.query;

    const width = 1080;
    const height = 1080;

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#340c46;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e50051;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)"/>
        <text x="${width / 2}" y="200" font-size="64" font-weight="bold" fill="white" text-anchor="middle">
          ${title || 'Event'}
        </text>
        <text x="${width / 2}" y="400" font-size="48" fill="white" text-anchor="middle">
          ${date || 'Date TBA'}
        </text>
        <text x="${width / 2}" y="550" font-size="36" fill="rgba(255,255,255,0.9)" text-anchor="middle">
          ${location || 'Berlin'}
        </text>
      </svg>
    `;

    const image = await sharp(Buffer.from(svg))
      .png({ quality: 80 })
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(image);
  } catch (error) {
    console.error('Error generating poster:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

export default router;
