'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setFormData({
      username: user.username,
      email: user.email,
    });
  }, [user, router]);

  const handleSave = async () => {
    // TODO: Implement profile update API
    alert('Profil güncelleme özelliği yakında eklenecek!');
    setIsEditing(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
            👤 Profil
          </h1>
          <p className="text-gray-600 text-lg">Hesap bilgilerinizi yönetin</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 relative">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl">
                {getInitials(user.username)}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{user.username}</h2>
                <p className="text-blue-100 mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Hesap Bilgileri</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-lg">
                    {user.role || 'USER'}
                  </span>
                </p>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    💾 Kaydet
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-t border-gray-200 px-8 py-8 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">İstatistikler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-sm text-gray-600">Oluşturulan Anket</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">-</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-sm text-gray-600">Verilen Yanıt</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">-</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-sm text-gray-600">Üyelik Süresi</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 px-8 py-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🔐 Şifre Değiştir</h3>
          <p className="text-gray-600 mb-6">Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirin</p>
          <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
            Şifre Değiştir
          </button>
        </div>
      </div>
    </div>
  );
}
