import React from 'react';

interface AvatarProps {
  name: string;
}

const Avatar: React.FC<AvatarProps> = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // Simple hash function to get a consistent color from a list
  const getColor = (str: string) => {
    let hash = 0;
    if (str.length === 0) return 'bg-gray-500';
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    const colors = [
      'bg-red-500', 'bg-emerald-500', 'bg-blue-500', 'bg-yellow-500',
      'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500',
      'bg-orange-500'
    ];
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const bgColor = getColor(name);

  return (
    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${bgColor}`}>
      <span>{initial}</span>
    </div>
  );
};

export default Avatar;