# Grandview Realty Wisconsin Website

A modern real estate website built with Next.js, featuring Wisconsin MLS API integration for real-time property listings in Wisconsin.

## Features

- Real-time property listings via Wisconsin MLS API
- Advanced property search
- Image optimization and CDN integration
- Responsive design
- Error handling and monitoring
- Rate limiting and caching
- **Automated cache refresh every hour via Vercel cron jobs**
- Admin dashboard with cache monitoring

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Vercel Deployment
- Wisconsin MLS API Integration

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Jhamm17/grandview-realty-wisconsin.git
cd grandview-realty-wisconsin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_WISCONSIN_MLS_API_URL=your_wisconsin_mls_api_url
NEXT_PUBLIC_WISCONSIN_MLS_TOKEN_URL=your_wisconsin_mls_token_url
WISCONSIN_MLS_CLIENT_ID=your_wisconsin_client_id
WISCONSIN_MLS_CLIENT_SECRET=your_wisconsin_client_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linter

## Deployment

The site is automatically deployed to Vercel on push to main branch.
Production URL: [https://grandviewwisconsin.com](https://grandviewwisconsin.com) (TBD)

## License

MIT License - See LICENSE file for details
