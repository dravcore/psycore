'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import authApi, { UserStats } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { ProfileSkeleton } from '@/components/Skeletons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    setFormData({
      username: user.username,
      email: user.email,
    });

    // Fetch user stats
    const fetchStats = async () => {
      try {
        const userStats = await authApi.getUserStats();
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [hydrated, user, router]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedUser = await authApi.updateProfile({
        username: formData.username !== user.username ? formData.username : undefined,
        email: formData.email !== user.email ? formData.email : undefined,
      });

      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profil başarıyla güncellendi!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    setLoading(true);
    try {
      await authApi.updateProfile({
        password: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
      });

      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Şifre başarıyla değiştirildi!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (statsLoading && !stats) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            👤 Profil
          </h1>
          <p className="text-muted-foreground text-lg">Hesap bilgilerinizi yönetin</p>
        </div>

        <Card className="overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-12 relative">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl font-bold text-primary shadow-xl">
                {getInitials(user.username)}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{user.username}</h2>
                <p className="text-primary-foreground/80 mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Hesap Bilgileri</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                {isEditing ? '❌ İptal' : '✏️ Düzenle'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <p className="text-gray-900 text-lg font-medium px-4 py-3 bg-gray-50 rounded-xl">
                    {user.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <p className="text-gray-900 text-lg font-medium px-4 py-3 bg-gray-50 rounded-xl">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <p className="text-gray-900 text-lg font-medium px-4 py-3 bg-gray-50 rounded-xl inline-block">
                  <span className="px-3 py-1 bg-muted rounded-lg">
                    {user.role || 'USER'}
                  </span>
                </p>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {loading ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-t border-gray-200 px-8 py-8 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">İstatistikler</h3>
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-sm text-gray-600">Oluşturulan Anket</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.totalSurveysCreated || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-sm text-gray-600">Verilen Yanıt</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.totalResponsesGiven || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-sm text-gray-600">AI Analizi</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats?.totalAnalyzedResponses || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-sm text-gray-600">Üyelik Süresi</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.membershipDays || 0} <span className="text-sm font-normal">gün</span></p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Password Change Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🔐 Şifre Değiştir</CardTitle>
            <CardDescription>Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirin</CardDescription>
          </CardHeader>
          <CardContent>
          {!isChangingPassword ? (
            <button 
              onClick={() => setIsChangingPassword(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Şifre Değiştir
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Değiştiriliyor...' : '🔒 Şifreyi Değiştir'}
                </button>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
