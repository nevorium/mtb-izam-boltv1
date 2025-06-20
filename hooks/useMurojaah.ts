import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db, getJakartaTimestamp, formatJakartaDate } from '@/lib/firebase';
import { useAuth } from './useAuth';

interface MurojaahData {
  completed: boolean;
  note: string;
  timestamp: string; // Jakarta timezone format: YYYY-MM-DD HH:mm:ss
  created_at: Timestamp;
}

export function useMurojaah() {
  const { user, getUserSignupTimestamp } = useAuth();
  const [todayData, setTodayData] = useState<MurojaahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signupTimestamp, setSignupTimestamp] = useState<string | null>(null);

  const getTodayKey = () => {
    return formatJakartaDate(new Date());
  };

  const loadSignupTimestamp = async () => {
    if (!user) return;
    
    const timestamp = await getUserSignupTimestamp(user.uid);
    setSignupTimestamp(timestamp);
  };

  const loadTodayData = async () => {
    if (!user) return;
    
    try {
      const todayKey = getTodayKey();
      const docRef = doc(db, 'users', user.uid, 'murojaah', todayKey);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setTodayData(docSnap.data() as MurojaahData);
      } else {
        setTodayData(null);
      }
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTodayData = async (data: Omit<MurojaahData, 'timestamp' | 'created_at'>) => {
    if (!user) return;

    try {
      const todayKey = getTodayKey();
      const docRef = doc(db, 'users', user.uid, 'murojaah', todayKey);
      const newData = {
        ...data,
        timestamp: getJakartaTimestamp(),
        created_at: Timestamp.now(),
      };
      
      await setDoc(docRef, newData);
      setTodayData(newData);
    } catch (error) {
      console.error('Error saving today data:', error);
    }
  };

  const getMonthlyData = async (month: Date) => {
    if (!user) return {};

    try {
      const year = month.getFullYear();
      const monthIndex = month.getMonth();
      const startDate = formatJakartaDate(new Date(year, monthIndex, 1));
      const endDate = formatJakartaDate(new Date(year, monthIndex + 1, 0));
      
      const q = query(
        collection(db, 'users', user.uid, 'murojaah'),
        where('__name__', '>=', startDate),
        where('__name__', '<=', endDate)
      );
      
      const querySnapshot = await getDocs(q);
      const monthlyData: { [key: string]: MurojaahData } = {};
      
      querySnapshot.forEach((doc) => {
        monthlyData[doc.id] = doc.data() as MurojaahData;
      });
      
      return monthlyData;
    } catch (error) {
      console.error('Error loading monthly data:', error);
      return {};
    }
  };

  const getWeeklyCompletionRate = async () => {
    if (!user) return 0;

    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      let completedDays = 0;
      let totalDays = 0;
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        if (date <= today) {
          // Check if date is after signup
          if (signupTimestamp && isDateAfterSignup(date, signupTimestamp)) {
            totalDays++;
            const dateKey = formatJakartaDate(date);
            const docRef = doc(db, 'users', user.uid, 'murojaah', dateKey);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().completed) {
              completedDays++;
            }
          }
        }
      }
      
      return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    } catch (error) {
      console.error('Error calculating weekly completion rate:', error);
      return 0;
    }
  };

  const getStreak = async () => {
    if (!user || !signupTimestamp) return 0;

    try {
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        // Don't count days before signup
        if (!isDateAfterSignup(date, signupTimestamp)) {
          break;
        }
        
        const dateKey = formatJakartaDate(date);
        const docRef = doc(db, 'users', user.uid, 'murojaah', dateKey);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().completed) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  const isDateAfterSignup = (date: Date, signupTimestamp: string) => {
    const signupDate = new Date(signupTimestamp.replace(' ', 'T') + '+07:00');
    return date >= signupDate;
  };

  const getDayStatus = (date: Date, monthlyData: { [key: string]: MurojaahData }) => {
    if (!signupTimestamp) return 'before-signup';
    
    const today = new Date();
    const dateKey = formatJakartaDate(date);
    
    // Future dates
    if (date > today) {
      return 'future';
    }
    
    // Before signup
    if (!isDateAfterSignup(date, signupTimestamp)) {
      return 'before-signup';
    }
    
    // Check if murojaah was completed
    const dayData = monthlyData[dateKey];
    if (dayData && dayData.completed) {
      return 'completed';
    }
    
    // No murojaah recorded (missed day)
    return 'missed';
  };

  useEffect(() => {
    if (user) {
      loadSignupTimestamp();
      loadTodayData();
    }
  }, [user]);

  return {
    todayData,
    loading,
    signupTimestamp,
    updateTodayData,
    getMonthlyData,
    getWeeklyCompletionRate,
    getStreak,
    getDayStatus,
  };
}