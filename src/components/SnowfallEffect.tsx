
'use client';

import Snowfall from 'react-snowfall';

const SnowfallEffect = () => {
  return (
    <Snowfall
      // Customize the snowfall effect
      color="#BFDFFF" // Using Ice Blue from your theme
      style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none' }}
      snowflakeCount={150}
    />
  );
};

export default SnowfallEffect;
