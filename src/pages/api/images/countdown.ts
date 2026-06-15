import sharp from 'sharp';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  try {
    const url = new URL(context.request.url);
    const deadline = url.searchParams.get('deadline');
    const eventName = url.searchParams.get('eventName');

    if (!deadline) {
      return new Response(JSON.stringify({ error: 'deadline parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const width = 1200;
    const height = 630;

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

    const image = await sharp(Buffer.from(svg))
      .png({ quality: 80 })
      .toBuffer();

    return new Response(image, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600'
      },
    });
  } catch (error) {
    console.error('Error generating countdown image:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
