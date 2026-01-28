# AyurLife Essentials - Static E-commerce/Services Site

This is a mobile-first, static website built for an Ayurvedic business. It features a product catalog, service listings, and direct integration with WhatsApp for orders and bookings.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: JavaScript

## Features
- **Mobile-First Design**: Optimized for phones and tablets.
- **Static Data**: Products and services are defined in `data/` folder, no database needed.
- **WhatsApp Integration**: "Order Now" buttons generate pre-filled WhatsApp messages with product details.
- **SEO Optimized**: Metadata and JSON-LD structured data included.
- **Performance**: Fast loading with Next.js static generation.

## Project Structure
```
├── app/                  # App Router pages and layout
│   ├── about/            # About page
│   ├── contact/          # Contact page
│   ├── products/         # Product listing
│   ├── services/         # Services listing
│   ├── globals.css       # Global styles & Tailwind
│   ├── layout.js         # Root layout (Header/Footer)
│   └── page.js           # Home page
├── components/           # Reusable UI components
│   ├── Header.jsx        # Navigation
│   ├── Footer.jsx        # Site footer
│   ├── ProductCard.jsx   # Product display card
│   ├── ServiceCard.jsx   # Service display card
│   └── WhatsAppButton.jsx # WhatsApp link generator
├── data/                 # Static data files
│   ├── products.js       # Product list
│   └── services.js       # Service list
├── lib/                  # Utilities and Config
│   ├── config.js         # Phone number & global settings
│   └── utils.js          # Helper functions
└── public/               # Static assets (images)
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for Production**
   ```bash
   npm run build
   npm run start
   ```

## Customization

### Changing Phone Number
Open `lib/config.js` and update the `phone` variable:
```javascript
export const CONFIG = {
  // ...
  phone: "919822949228", // Your number here
  // ...
};
```

### Adding/Editing Products
Open `data/products.js` and modify the array. Ensure you provide a unique `id` and `sku`.

### Adding Images
Place your images in the `public/images/` folder and update the paths in `data/products.js` or `data/services.js`.
(Note: You need to create `public/images/` folder manually if not present, or drop images directly in `public/`).

## Deployment (Vercel)

This project is optimized for [Vercel](https://vercel.com).

1. Push this code to a Git repository (GitHub/GitLab).
2. Login to Vercel and "Import Project".
3. Select your repository.
4. Keep default settings (Next.js preset).
5. Click **Deploy**.

## License
Private Property.
