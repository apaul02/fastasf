'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-xl mb-6">We couldn’t find that page.</p>
      <Link href="/" className="text-blue-500 underline hover:text-blue-700">
        Return home
      </Link>
    </div>
  );
}
