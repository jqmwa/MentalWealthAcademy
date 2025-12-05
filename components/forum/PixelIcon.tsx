import React from 'react';
import Image from 'next/image';

export function PixelIcon() {
  return (
    <Image
      src="https://i.imgur.com/IGn2jQ5.png"
      alt="Crystal Star Icon"
      width={50}
      height={50}
      className="flex-shrink-0"
    />
  );
}

