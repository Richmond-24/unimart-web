import { NextResponse } from 'next/server';

const slides = [
  {
    id: '1',
    title: 'Welcome to UniMart',
    description: 'Your campus marketplace for buying and selling',
    imageUrl: '/images/hero-banner-1.jpg',
    buttonText: 'Shop Now',
    link: '/products',
  },
  {
    id: '2',
    title: 'Find Great Deals',
    description: 'Discover amazing products from fellow students',
    imageUrl: '/images/hero-banner-2.jpg',
    buttonText: 'Explore',
    link: '/products',
  },
  {
    id: '3',
    title: 'Sell Your Items',
    description: 'List your items and reach thousands of students',
    imageUrl: '/images/hero-banner-3.jpg',
    buttonText: 'Start Selling',
    link: '/sell',
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: slides });
}
