import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings as SettingsIcon, Bell, User, LogOut, Info, Shield } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { LogoutConfirmation } from '@/components/LogoutConfirmation';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [prayerReminders, setPrayerReminders] = useState({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  });

  const { user, logout, logoutMessage, clearLogoutMessage } = useAuth();
  const router = useRouter();

  // Show logout confirmation when message is available
  useEffect(() => {
    if (logoutMessage) {
      // Auto redirect to login after showing confirmation
      const timer = setTimeout(() => {
        clearLogoutMessage();
        router.replace('/(auth)/login');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [logoutMessage, router, clearLogoutMessage]);

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari aplikasi? Semua data sesi akan dihapus dan Anda perlu login kembali.',
      [
        { 
          text: 'Batal', 
          style: 'cancel',
          onPress: () => console.log('Logout cancelled')
        },
        {
          text: 'Ya, Keluar',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Error', result.error || 'Gagal logout');
            }
            // Success case is handled by the useEffect above
          },
        },
      ],
      { cancelable: true }
    );
  };

  const togglePrayerReminder = (prayerId: string) => {
    setPrayerReminders(prev => ({
      ...prev,
      [prayerId]: !prev[prayerId as keyof typeof prev],
    }));
  };

  const prayerTimes = [
    { id: 'fajr', name: 'Subuh', time: '05:00' },
    { id: 'dhuhr', name: 'Dzuhur', time: '12:00' },
    { id: 'asr', name: 'Ashar', time: '15:30' },
    { id: 'maghrib', name: 'Maghrib', time: '18:00' },
    { id: 'isha', name: 'Isya', time: '19:30' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <SettingsIcon size={32} color="#FFFFFF" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Pengaturan</Text>
              <Text style={styles.headerSubtitle}>
                Kustomisasi aplikasi sesuai kebutuhan
              </Text>
            </View>
          </View>
        </View>

        {/* User Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Pengguna</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.profileIcon}>
              <User size={24} color="#3B82F6" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || 'Pengguna'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keamanan</Text>
          
          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Shield size={24} color="#22C55E" />
            </View>
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>Sesi Aman</Text>
              <Text style={styles.securityDescription}>
                Sesi Anda akan otomatis berakhir setelah 24 jam untuk keamanan
              </Text>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengaturan Notifikasi</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Bell size={24} color="#3B82F6" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Aktifkan Notifikasi</Text>
                <Text style={styles.settingDescription}>
                  Terima pengingat untuk murojaah
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          {notificationsEnabled && (
            <View style={styles.prayerTimesContainer}>
              <Text style={styles.subSectionTitle}>Pengingat Waktu Sholat</Text>
              {prayerTimes.map((prayer) => (
                <View key={prayer.id} style={styles.prayerTimeItem}>
                  <View style={styles.prayerTimeContent}>
                    <Text style={styles.prayerTimeName}>{prayer.name}</Text>
                    <Text style={styles.prayerTimeTime}>{prayer.time}</Text>
                  </View>
                  <Switch
                    value={prayerReminders[prayer.id as keyof typeof prayerReminders]}
                    onValueChange={() => togglePrayerReminder(prayer.id)}
                    trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                    thumbColor={prayerReminders[prayer.id as keyof typeof prayerReminders] ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Aplikasi</Text>
          
          <View style={styles.infoCard}>
            <Info size={24} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.appTitle}>Murojaah Tracker</Text>
              <Text style={styles.appVersion}>Versi 1.0.0</Text>
              <Text style={styles.appDescription}>
                Aplikasi untuk membantu tracking progress murojaah harian Anda. 
                Dengan fitur kalender heat map, statistik mingguan, dan pengingat 
                waktu sholat untuk menjaga konsistensi murojaah.
              </Text>
            </View>
          </View>
        </View>

        {/* Secure Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={24} color="#EF4444" />
            <View style={styles.logoutContent}>
              <Text style={styles.logoutButtonText}>Keluar dari Aplikasi</Text>
              <Text style={styles.logoutDescription}>
                Hapus semua data sesi dan keluar dengan aman
              </Text>
            </View>
          </TouchableOpacity>
        </View>
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
    height: 160,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
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
  section: {
    margin: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  securityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  securityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  securityDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  prayerTimesContainer: {
    marginTop: 8,
  },
  prayerTimeItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  prayerTimeContent: {
    flex: 1,
  },
  prayerTimeName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  prayerTimeTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
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
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  appTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  appVersion: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 2,
  },
  appDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutContent: {
    marginLeft: 16,
    flex: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  logoutDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
});