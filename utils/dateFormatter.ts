
import { ContractStatus, SupportContractStatus } from '../types';
import jalaali from 'jalaali-js';

// declare const jalaali: any;

export const toPersianDigits = (n: string | number): string => {
  if (n === undefined || n === null) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
};

export const convertPersianToEnglish = (s: string): string => {
  if (!s) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = s;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], "g"), englishDigits[i]);
  }
  return result;
};


export const formatSecondsToTime = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "۰۰:۰۰:۰۰";
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};


export const formatJalaali = (date: Date): string => {
    const jalaaliDate = jalaali.toJalaali(date);
    return `${jalaaliDate.jy}/${String(jalaaliDate.jm).padStart(2, '0')}/${String(jalaaliDate.jd).padStart(2, '0')}`;
}

export const formatJalaaliDateTime = (date: Date): string => {
    const jalaaliDate = jalaali.toJalaali(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${jalaaliDate.jy}/${String(jalaaliDate.jm).padStart(2, '0')}/${String(jalaaliDate.jd).padStart(2, '0')} ${hours}:${minutes}`;
};

export const formatCurrency = (n: number): string => {
    if (n === undefined || n === null || isNaN(n)) return '';
    return toPersianDigits(n.toLocaleString('en-US'));
};

export const parseJalaali = (dateStr: string): Date | null => {
    if (!dateStr || !/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) return null;
    const [jy, jm, jd] = dateStr.split('/').map(Number);
    if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null;
    const greg = jalaali.toGregorian(jy, jm, jd);
    return new Date(greg.gy, greg.gm - 1, greg.gd);
};

export const parseJalaaliDateTime = (dateTimeStr: string): Date | null => {
    if (!dateTimeStr) return null;
    const parts = dateTimeStr.split(' ');
    if (parts.length !== 2) return null;
    
    const datePart = parts[0];
    const timePart = parts[1];

    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    if (!dateRegex.test(datePart) || !timeRegex.test(timePart)) return null;

    const [jy, jm, jd] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    if (isNaN(jy) || isNaN(jm) || isNaN(jd) || isNaN(hour) || isNaN(minute)) return null;

    const greg = jalaali.toGregorian(jy, jm, jd);
    // Create date in local timezone
    return new Date(greg.gy, greg.gm - 1, greg.gd, hour, minute);
};


export const getCalculatedStatus = (endDateStr: string, currentStatus: ContractStatus | SupportContractStatus): ContractStatus | SupportContractStatus => {
    // These statuses are manually set and should not be overridden by date calculation.
    if (currentStatus === 'لغو شده' || currentStatus === 'در انتظار تایید') {
        return currentStatus;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = parseJalaali(endDateStr);

    if (!endDate) {
        // If end date is not valid or not set, it cannot be expired. So it's active.
        return 'فعال'; 
    }
    
    // Set time to end of day for comparison
    endDate.setHours(23, 59, 59, 999);

    if (today > endDate) {
        return 'منقضی شده';
    }
    
    return 'فعال';
};

export const getPurchaseContractStatusByDate = (startDateStr: string, endDateStr: string): 'فعال' | 'منقضی شده' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = parseJalaali(startDateStr);
    const endDate = parseJalaali(endDateStr);

    if (!startDate || !endDate) {
        return 'فعال'; // Default if dates are invalid
    }
    
    // Set times for accurate comparison
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,999);

    if (today >= startDate && today <= endDate) {
        return 'فعال';
    }

    return 'منقضی شده';
};


export const isToday = (someDate: Date): boolean => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getFullYear() === today.getFullYear();
};

export const isDateInRange = (date: Date, startDate: Date | null, endDate: Date | null): boolean => {
    if (!startDate || !endDate) return false;
    
    const checkTime = new Date(date).setHours(0, 0, 0, 0);
    const startTime = new Date(startDate).setHours(0, 0, 0, 0);
    const endTime = new Date(endDate).setHours(0, 0, 0, 0);

    return checkTime >= startTime && checkTime <= endTime;
}

export const exportReportToCSV = (
  reportType: 'customers' | 'contracts' | 'tickets',
  data: any[],
  columns: string[],
  filters: any
) => {
  const reportTitles = {
    customers: 'گزارش مشتریان',
    contracts: 'گزارش قراردادها',
    tickets: 'گزارش تیکت‌ها',
  };

  let csvContent = '';
  const toPersian = (n: any) => toPersianDigits(String(n));

  // 1. Add Header Info
  csvContent += `"${reportTitles[reportType]}"\n`;
  csvContent += `تاریخ گزارش:,"${toPersian(formatJalaali(new Date()))}"\n`;
  if (filters.startDate || filters.endDate) {
    csvContent += `بازه زمانی:,"از ${filters.startDate ? toPersian(filters.startDate) : 'ابتدا'} تا ${filters.endDate ? toPersian(filters.endDate) : 'انتها'}"\n`;
  }
  csvContent += '\n'; // Spacer

  // 2. Add KPIs
  csvContent += '"شاخص‌های کلیدی عملکرد (KPIs)"\n';
  const kpis: string[][] = [];

  if (reportType === 'customers' && data.length > 0) {
    kpis.push(['تعداد کل مشتریان در گزارش', toPersian(data.length)]);
    const statusCounts = data.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    kpis.push(['تفکیک وضعیت:']);
    for (const status in statusCounts) {
      kpis.push([`  - ${status}`, toPersian(statusCounts[status])]);
    }
    const levelCounts = data.reduce((acc, row) => {
      acc[row.level] = (acc[row.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    kpis.push(['تفکیک سطح:']);
    for (const level in levelCounts) {
      kpis.push([`  - سطح ${level}`, toPersian(levelCounts[level])]);
    }
  } else if (reportType === 'contracts' && data.length > 0) {
    kpis.push(['تعداد کل قراردادها', toPersian(data.length)]);
    const totalValue = data.reduce((sum, row) => sum + parseFloat(String(row.amount || '0').replace(/,/g, '')), 0);
    kpis.push(['مجموع مبلغ قراردادها (ریال)', formatCurrency(totalValue)]);
    const typeCounts = data.reduce((acc, row) => {
      acc[row.type] = (acc[row.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    kpis.push(['تفکیک نوع قرارداد:']);
    for (const type in typeCounts) {
      kpis.push([`  - ${type}`, toPersian(typeCounts[type])]);
    }
     const statusCounts = data.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    kpis.push(['تفکیک وضعیت:']);
    for (const status in statusCounts) {
      kpis.push([`  - ${status}`, toPersian(statusCounts[status])]);
    }
  } else if (reportType === 'tickets' && data.length > 0) {
    kpis.push(['تعداد کل تیکت‌ها', toPersian(data.length)]);
    const statusCounts = data.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    kpis.push(['تفکیک وضعیت:']);
    for (const status in statusCounts) {
      kpis.push([`  - ${status}`, toPersian(statusCounts[status])]);
    }
     const priorityCounts = data.reduce((acc, row) => {
      acc[row.priority] = (acc[row.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    kpis.push(['تفکیک اولویت:']);
    for (const priority in priorityCounts) {
      kpis.push([`  - ${priority}`, toPersian(priorityCounts[priority])]);
    }
  }

  kpis.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  csvContent += '\n'; // Spacer

  // 3. Add Data Table
  csvContent += '"جزئیات گزارش"\n';
  // Add column headers
  csvContent += columns.map(col => `"${col}"`).join(',') + '\n';
  // Add data rows
  data.forEach(row => {
    const rowValues = Object.values(row).map(val => `"${toPersian(val)}"`);
    csvContent += rowValues.join(',') + '\n';
  });

  // 4. Create and download the file
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    const filename = `report_${reportType}_${toPersian(formatJalaali(new Date()))}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
