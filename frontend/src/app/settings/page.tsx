'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import Navbar from '@/components/Navbar';
import authApi from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            ⚙️ Ayarlar
          </h1>
          <p className="text-muted-foreground text-lg">Uygulama tercihlerinizi yönetin</p>
        </div>

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔔 Bildirimler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notif">E-posta Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">Yeni yanıtlar hakkında bildirim al</p>
              </div>
              <Switch
                id="email-notif"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="survey-notif">Anket Tamamlandı</Label>
                <p className="text-sm text-muted-foreground">Anket tamamlandığında bildir</p>
              </div>
              <Switch
                id="survey-notif"
                checked={preferences.surveyCompletedNotifications}
                onCheckedChange={(checked) => updatePreference('surveyCompletedNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔒 Gizlilik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profile-visibility">Profil Görünürlüğü</Label>
                <p className="text-sm text-muted-foreground">Diğer kullanıcılar profilimi görebilsin</p>
              </div>
              <Switch
                id="profile-visibility"
                checked={preferences.profileVisibility}
                onCheckedChange={(checked) => updatePreference('profileVisibility', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous">Anonim Yanıtlar</Label>
                <p className="text-sm text-muted-foreground">Yanıtlarım anonim olarak kaydedilsin</p>
              </div>
              <Switch
                id="anonymous"
                checked={preferences.anonymousResponses}
                onCheckedChange={(checked) => updatePreference('anonymousResponses', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🎨 Görünüm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Tema</Label>
              <div className="flex space-x-3">
                <Button
                  variant={preferences.theme === 'light' ? 'default' : 'outline'}
                  onClick={() => updatePreference('theme', 'light')}
                  className="flex-1"
                >
                  ☀️ Açık
                </Button>
                <Button
                  variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => updatePreference('theme', 'dark')}
                  className="flex-1"
                >
                  🌙 Koyu
                </Button>
                <Button
                  variant={preferences.theme === 'auto' ? 'default' : 'outline'}
                  onClick={() => updatePreference('theme', 'auto')}
                  className="flex-1"
                >
                  🔄 Otomatik
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="language">Dil</Label>
              <select 
                id="language"
                value={preferences.language}
                onChange={(e) => updatePreference('language', e.target.value as 'tr' | 'en')}
                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ Tehlikeli Bölge</CardTitle>
            <CardDescription>
              Bu işlemler geri alınamaz. Lütfen dikkatli olun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              🗑️ Hesabı Sil
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account Dialog */}
        <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Hesabınızı silmek istediğinizden emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz. Tüm anketleriniz, yanıtlarınız ve analizleriniz kalıcı olarak silinecektir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="delete-password">Şifrenizi Girin</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeletePassword('');
                }}
                disabled={deleteLoading}
              >
                İptal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteLoading ? '⏳ Siliniyor...' : '🗑️ Hesabı Kalıcı Olarak Sil'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
