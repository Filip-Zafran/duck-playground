import sharp from 'sharp';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  try {
    const url = new URL(context.request.url);
    const title = url.searchParams.get('title');
    const date = url.searchParams.get('date');
    const location = url.searchParams.get('location');

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

    return new Response(image, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400'
      },
    });
  } catch (error) {
    console.error('Error generating poster:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
