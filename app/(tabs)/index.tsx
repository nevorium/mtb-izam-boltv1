import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle2, Circle, BookOpen, Zap, LogOut } from 'lucide-react-native';
import { MotivationWidget } from '@/components/MotivationWidget';
import { PrayerTimeReminder } from '@/components/PrayerTimeReminder';
import { LogoutConfirmation } from '@/components/LogoutConfirmation';
import { useMurojaah } from '@/hooks/useMurojaah';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [note, setNote] = useState('');
  const [streak, setStreak] = useState(0);
  const { todayData, updateTodayData, getStreak } = useMurojaah();
  const { user, logout, logoutMessage, clearLogoutMessage, validateSession } = useAuth();
  const router = useRouter();

  // Validate session on component mount and periodically
  useEffect(() => {
    const checkSession = async () => {
      const isValid = await validateSession();
      if (!isValid && user) {
        // Session expired, user will be logged out automatically
        return;
      }
    };

    checkSession();
    
    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, validateSession]);

  // Handle logout confirmation and redirect
  useEffect(() => {
    if (logoutMessage) {
      const timer = setTimeout(() => {
        clearLogoutMessage();
        router.replace('/(auth)/login');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [logoutMessage, router, clearLogoutMessage]);

  useEffect(() => {
    const loadStreak = async () => {
      const currentStreak = await getStreak();
      setStreak(currentStreak);
    };
    loadStreak();
  }, [todayData?.completed]);

  const handleToggleComplete = async () => {
    const newCompleted = !todayData?.completed;
    await updateTodayData({
      completed: newCompleted,
      note: note || todayData?.note || '',
    });
  };

  const handleSaveNote = async () => {
    await updateTodayData({
      completed: todayData?.completed || false,
      note: note,
    });
  };

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) {
      console.error('Logout failed:', result.error);
    }
    // Success case is handled by useEffect above
  };

  useEffect(() => {
    if (todayData?.note) {
      setNote(todayData.note);
    }
  }, [todayData]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <BookOpen size={32} color="#FFFFFF" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Murojaah Tracker</Text>
                <Text style={styles.headerSubtitle}>
                  Selamat datang, {user?.displayName || 'Pengguna'}
                </Text>
                <Text style={styles.headerDate}>
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivation Widget */}
        <MotivationWidget 
          isCompleted={todayData?.completed || false}
          streak={streak}
        />

        {/* Main Checklist */}
        <View style={styles.checklistContainer}>
          <Text style={styles.sectionTitle}>Checklist Harian</Text>
          
          <TouchableOpacity
            style={[
              styles.checklistItem,
              todayData?.completed && styles.checklistItemCompleted
            ]}
            onPress={handleToggleComplete}
          >
            <View style={styles.checklistContent}>
              {todayData?.completed ? (
                <CheckCircle2 size={32} color="#22C55E" />
              ) : (
                <Circle size={32} color="#9CA3AF" />
              )}
              <View style={styles.checklistText}>
                <Text style={[
                  styles.checklistTitle,
                  todayData?.completed && styles.checklistTitleCompleted
                ]}>
                  Murojaah Hari Ini
                </Text>
                <Text style={styles.checklistDescription}>
                  Klik untuk menandai sebagai selesai
                </Text>
              </View>
            </View>
            {todayData?.completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Selesai</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Note Section */}
        <View style={styles.noteContainer}>
          <Text style={styles.sectionTitle}>Catatan Progress</Text>
          <View style={styles.noteInputContainer}>
            <TextInput
              style={styles.noteInput}
              multiline
              numberOfLines={4}
              placeholder="Tulis catatan progress murojaah hari ini..."
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveNote}
            >
              <Text style={styles.saveButtonText}>Simpan Catatan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prayer Time Reminder */}
        <PrayerTimeReminder />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        visible={!!logoutMessage}
        message={logoutMessage || ''}
        onClose={clearLogoutMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    marginTop: 2,
  },
  headerDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  checklistContainer: {
    margin: 20,
    marginBottom: 16,
  },
  checklistItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  checklistItemCompleted: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  checklistContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistText: {
    marginLeft: 16,
    flex: 1,
  },
  checklistTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  checklistTitleCompleted: {
    color: '#16A34A',
  },
  checklistDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  noteContainer: {
    margin: 20,
    marginTop: 4,
  },
  noteInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noteInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});