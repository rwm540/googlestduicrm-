import React from 'react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 text-gray-500">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-cyan-500 mb-4">{title}</h1>
        <p className="text-lg">این صفحه در حال ساخت است.</p>
        <p className="mt-2">لطفا بعدا دوباره سر بزنید.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;