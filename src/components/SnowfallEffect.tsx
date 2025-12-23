
'use client';

import Snowfall from 'react-snowfall';

const SnowfallEffect = () => {
  return (
    <Snowfall
      color="#BFDFFF" // A light, icy blue
      style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 500, pointerEvents: 'none' }}
      snowflakeCount={150}
    />
  );
};

export default SnowfallEffect;
