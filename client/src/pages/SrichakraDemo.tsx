import React from 'react';
import SrichakraText from '@/components/custom/SrichakraText';

const SrichakraDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Srichakra Text Variations</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-medium mb-6 border-b pb-2">Default Style</h2>
          <div className="flex justify-center mb-8">
            <SrichakraText>Srichakra</SrichakraText>
          </div>
          
          <h2 className="text-xl font-medium mb-6 border-b pb-2">Different Sizes</h2>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">Small:</div>
              <SrichakraText size="sm">Srichakra</SrichakraText>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">Medium:</div>
              <SrichakraText size="lg">Srichakra</SrichakraText>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">Large:</div>
              <SrichakraText size="2xl">Srichakra</SrichakraText>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">X-Large:</div>
              <SrichakraText size="4xl">Srichakra</SrichakraText>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-medium mb-6 border-b pb-2">Different Colors</h2>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-28 text-sm text-gray-500">Default:</div>
              <SrichakraText>Srichakra</SrichakraText>
            </div>
            <div className="flex items-center">
              <div className="w-28 text-sm text-gray-500">Red:</div>
              <SrichakraText color="text-red-800">Srichakra</SrichakraText>
            </div>
            <div className="flex items-center">
              <div className="w-28 text-sm text-gray-500">Blue:</div>
              <SrichakraText color="text-blue-800">Srichakra</SrichakraText>
            </div>
            <div className="flex items-center">
              <div className="w-28 text-sm text-gray-500">Dark Green:</div>
              <SrichakraText color="text-emerald-800">Srichakra</SrichakraText>
            </div>
            <div className="flex items-center">
              <div className="w-28 text-sm text-gray-500">Purple:</div>
              <SrichakraText color="text-purple-800">Srichakra</SrichakraText>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-medium mb-6 border-b pb-2">Without Decorative Elements</h2>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-28 text-sm text-gray-500">No decorations:</div>
              <SrichakraText decorative={false}>Srichakra</SrichakraText>
            </div>
            <div className="flex items-center">
              <div className="w-28 text-sm text-gray-500">Large, no dec:</div>
              <SrichakraText size="3xl" decorative={false}>Srichakra</SrichakraText>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-medium mb-6 border-b pb-2">On Different Backgrounds</h2>
          
          <div className="p-4 bg-amber-900 rounded-lg mb-4 flex justify-center">
            <SrichakraText color="text-amber-100" size="2xl">Srichakra</SrichakraText>
          </div>
          
          <div className="p-4 bg-blue-900 rounded-lg mb-4 flex justify-center">
            <SrichakraText color="text-blue-100" size="2xl">Srichakra</SrichakraText>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-amber-500 to-red-500 rounded-lg flex justify-center">
            <SrichakraText color="text-white" size="2xl">Srichakra</SrichakraText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SrichakraDemo;