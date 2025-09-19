import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { User } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoadingSpinnerIcon } from './icons/LoadingSpinnerIcon';

// Define the structure for the analysis result
interface AnalysisResult {
  title: string;
  score: number;
  analysis: string;
}

const toPersianDigits = (n: string | number): string => {
  if (n === undefined || n === null) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
};

// A new component for the progress bar
const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const getBarColor = (s: number) => {
    if (s < 40) return 'bg-red-500';
    if (s < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(score)}`} 
        style={{ width: `${score}%` }}
      ></div>
    </div>
  );
};

// FIX: Define props interface for GeminiAnalysis component.
interface GeminiAnalysisProps {
  users: User[];
}

const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ users }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysisResults(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Data Preparation
      const totalUsers = users.length;
      const supportUsers = users.filter(u => u.role === 'پشتیانی').length;
      const devUsers = users.filter(u => u.role === 'برنامه نویس').length;
      const salesUsers = users.filter(u => u.role === 'فروش').length;
      const adminUsers = users.filter(u => u.role === 'مدیر').length;
      
      const dataSummary = `
      - تعداد کل پرسنل: ${totalUsers}
      - تفکیک پرسنل:
        - مدیر: ${adminUsers}
        - فروش: ${salesUsers}
        - پشتیبانی: ${supportUsers}
        - برنامه‌نویس: ${devUsers}
      `;

      // 2. Define Schema
      const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'عنوان حوزه تحلیل به فارسی.',
            },
            score: {
              type: Type.INTEGER,
              description: 'امتیاز عددی از ۰ تا ۱۰۰ برای این حوزه.',
            },
            analysis: {
              type: Type.STRING,
              description: 'تحلیل کوتاه و خلاصه (حداکثر دو جمله) برای این حوزه به فارسی.',
            },
          },
          required: ["title", "score", "analysis"],
        },
      };

      // 3. Construct Prompt
      const analysisCategories = [
        "مدیریت",
        "بهره وری",
        "ریسک منابع انسانی",
        "تخصیص منابع"
      ];
      
      const prompt = `
شما یک تحلیلگر ارشد کسب و کار هستید. وظیفه شما تحلیل داده‌های روزانه یک داشبورد CRM و ارائه یک ارزیابی درصدی و نموداری (مبتنی بر امتیاز) است.
پاسخ شما باید **فقط و فقط** یک آرایه JSON باشد که تحلیل‌ها برای هر یک از حوزه های زیر را در بر می‌گیرد و کاملا با اسکیمای ارائه شده مطابقت دارد. تمام متون باید به زبان فارسی روان و حرفه‌ای باشد.

حوزه های تحلیل: ${analysisCategories.join(', ')}

داده‌های امروز به شرح زیر است:
${dataSummary}

بر اساس این داده‌ها، عملکرد سازمان را در حوزه‌های مشخص شده تحلیل کنید.
برای هر حوزه، یک امتیاز از ۰ تا ۱۰۰ و یک تحلیل کوتاه حداکثر دو جمله‌ای ارائه دهید.
امتیاز بالا (نزدیک به ۱۰۰) نشان‌دهنده وضعیت مطلوب و امتیاز پایین (نزدیک به ۰) نشان‌دهنده وضعیت بحرانی است.
- برای 'مدیریت'، ترکیب تیم و نسبت مدیر به کارمند را بسنجید.
- برای 'بهره وری'، پتانسیل نیروی کار موجود را ارزیابی کنید.
- برای 'ریسک منابع انسانی'، وابستگی به یک تیم خاص (مثلا پشتیبانی) را تحلیل کنید.
- برای 'تخصیص منابع'، تعادل بین تیم‌های مختلف را ارزیابی کنید.
`;

      // 4. Call API
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const jsonStr = response.text.trim();
      const parsedAnalysis = JSON.parse(jsonStr);

      if (Array.isArray(parsedAnalysis)) {
        setAnalysisResults(parsedAnalysis);
      } else {
        throw new Error("پاسخ دریافت شده در فرمت مورد انتظار نیست.");
      }

    } catch (err) {
      console.error("Gemini API error:", err);
      setError("متاسفانه در دریافت تحلیل خطایی رخ داد. فرمت پاسخ نامعتبر است یا مشکلی در ارتباط با سرویس وجود دارد. لطفا دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-700">تحلیل هوشمند وضعیت</h3>
            <p className="text-gray-500">ارزیابی عملکرد سازمان در حوزه‌های کلیدی به صورت درصدی.</p>
          </div>
           <button
                onClick={handleAnalysis}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <LoadingSpinnerIcon className="h-5 w-5" />
                        <span>در حال تحلیل...</span>
                    </>
                ) : (
                    <>
                        <SparklesIcon className="h-5 w-5" />
                        <span>{analysisResults ? 'تحلیل مجدد' : 'شروع تحلیل'}</span>
                    </>
                )}
            </button>
      </div>
      
      {loading && (
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <LoadingSpinnerIcon className="h-8 w-8 text-cyan-600 mb-4" />
            <p>لطفا صبر کنید، در حال آماده سازی تحلیل...</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-red-700 bg-red-50 rounded-lg">
            <p>{error}</p>
        </div>
      )}
      
      {analysisResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {analysisResults.map((result, index) => (
                <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-slate-800">{result.title}</h4>
                        <span className="font-bold font-mono text-cyan-600">{toPersianDigits(result.score)}٪</span>
                    </div>
                    <ScoreBar score={result.score} />
                    <p className="text-sm text-gray-500 mt-2">{result.analysis}</p>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default GeminiAnalysis;