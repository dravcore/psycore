'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import Navbar from '@/components/Navbar';
import authApi from '@/lib/api/auth';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { preferences, updatePreference } = useSettingsStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    
    if (!user) {
      router.push('/login');
    }
  }, [user, router, hydrated]);

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Şifrenizi girin!');
      return;
    }

    if (!confirm('⚠️ Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await authApi.deleteAccount(deletePassword);
      clearAuth();
      toast.success('Hesabınız başarıyla silindi.');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Hesap silinirken bir hata oluştu');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
            ⚙️ Ayarlar
          </h1>
          <p className="text-gray-600 text-lg">Uygulama tercihlerinizi yönetin</p>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">🔔 Bildirimler</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">E-posta Bildirimleri</p>
                <p className="text-sm text-gray-600">Yeni yanıtlar hakkında bildirim al</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.emailNotifications}
                  onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Anket Tamamlandı</p>
                <p className="text-sm text-gray-600">Anket tamamlandığında bildir</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.surveyCompletedNotifications}
                  onChange={(e) => updatePreference('surveyCompletedNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">🔒 Gizlilik</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Profil Görünürlüğü</p>
                <p className="text-sm text-gray-600">Diğer kullanıcılar profilimi görebilsin</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.profileVisibility}
                  onChange={(e) => updatePreference('profileVisibility', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Anonim Yanıtlar</p>
                <p className="text-sm text-gray-600">Yanıtlarım anonim olarak kaydedilsin</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.anonymousResponses}
                  onChange={(e) => updatePreference('anonymousResponses', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">🎨 Görünüm</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-800 mb-3">Tema</p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => updatePreference('theme', 'light')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    preferences.theme === 'light'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ☀️ Açık
                </button>
                <button 
                  onClick={() => updatePreference('theme', 'dark')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    preferences.theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🌙 Koyu
                </button>
                <button 
                  onClick={() => updatePreference('theme', 'auto')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    preferences.theme === 'auto'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🔄 Otomatik
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-800 mb-3">Dil</p>
              <select 
                value={preferences.language}
                onChange={(e) => updatePreference('language', e.target.value as 'tr' | 'en')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-red-800 mb-4">⚠️ Tehlikeli Bölge</h3>
          <p className="text-red-700 mb-6">
            Bu işlemler geri alınamaz. Lütfen dikkatli olun.
          </p>
          
          {!showDeleteModal ? (
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg"
            >
              🗑️ Hesabı Sil
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-100 border border-red-300 rounded-xl">
                <p className="font-semibold text-red-900 mb-2">⚠️ Dikkat!</p>
                <p className="text-sm text-red-800">
                  Hesabınızı silmek için şifrenizi girin. Bu işlem tüm anketlerinizi, 
                  yanıtlarınızı ve analizlerinizi kalıcı olarak silecektir.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-red-800 mb-2">
                  Şifrenizi Girin
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }}
                  disabled={deleteLoading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  {deleteLoading ? '⏳ Siliniyor...' : '🗑️ Hesabı Kalıcı Olarak Sil'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
