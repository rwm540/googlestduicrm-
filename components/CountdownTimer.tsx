import React, { useState, useEffect } from 'react';
import { toPersianDigits } from '../utils/dateFormatter';

interface CountdownTimerProps {
  targetDate: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isFinished: true,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isFinished: false,
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });
  
  if (timeLeft.isFinished) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-600">زمان تمام شد</span>;
  }
  
  const formattedTime = timeLeft.days > 0 
    ? `${toPersianDigits(timeLeft.days)} روز و ${toPersianDigits(timeLeft.hours)} ساعت`
    : `${toPersianDigits(String(timeLeft.hours).padStart(2,'0'))}:${toPersianDigits(String(timeLeft.minutes).padStart(2,'0'))}:${toPersianDigits(String(timeLeft.seconds).padStart(2,'0'))}`;

  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 font-mono tracking-wider" title="زمان باقیمانده">
        {formattedTime}
    </span>
  );
};

export default CountdownTimer;
