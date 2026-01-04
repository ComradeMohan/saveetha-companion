'use client';

import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline/next'), {
  ssr: false,
});

export default function RobotPage() {
  return (
    <main className="h-screen w-full">
      <Spline
        scene="https://prod.spline.design/0o4S2x7ky3TKB5za/scene.splinecode" 
      />
    </main>
  );
}
