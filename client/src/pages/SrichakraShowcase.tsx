import React from 'react';
import SrichakraText from '@/components/custom/SrichakraText';

const SrichakraShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-12">Srichakra with Samarkan Font</h1>
        
        {/* Large showcase display */}
        <div className="mb-16">
          <SrichakraText size="5xl" color="text-amber-800">Srichakra</SrichakraText>
        </div>
        
        {/* Font information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-medium mb-4 border-b pb-2">About the Font</h2>
          <p className="text-gray-700 mb-4">
            The "Samarkan" font gives "Srichakra" a Sanskrit-inspired look while keeping it in English text. 
            This font is specifically designed to evoke the aesthetic of Devanagari script while remaining readable in Latin characters.
          </p>
          <p className="text-gray-700">
            The font features decorative serifs and flowing curves characteristic of Sanskrit writing systems,
            creating an authentic cultural aesthetic for the Srichakra text.
          </p>
        </div>
        
        {/* Other examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-6 flex flex-col items-center">
            <h3 className="text-lg font-medium mb-4">Without decorative elements</h3>
            <SrichakraText size="3xl" decorative={false}>Srichakra</SrichakraText>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-6 flex flex-col items-center">
            <h3 className="text-lg font-medium mb-4">With decorative elements</h3>
            <SrichakraText size="3xl">Srichakra</SrichakraText>
          </div>
        </div>
        
        {/* Sanskrit meaning */}
        <div className="bg-amber-900/90 text-amber-50 rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-medium mb-4 border-b border-amber-700 pb-2">Sanskrit Meaning</h2>
          <p className="mb-4">
            "Sri" (श्री) refers to "divine energy" or "sacred" and "Chakra" (चक्र) means "wheel" or "disc".
          </p>
          <p>
            Together, "Srichakra" (श्रीचक्र) represents the sacred cosmic diagram used in Shri Vidya 
            school of Hindu tantra, symbolizing the universe and the body of the goddess.
          </p>
        </div>
      </div>
      
      <div className="mt-12">
        <a 
          href="/srichakra-demo" 
          className="text-amber-800 underline hover:text-amber-600"
        >
          View all Srichakra text variations →
        </a>
      </div>
    </div>
  );
};

export default SrichakraShowcase;