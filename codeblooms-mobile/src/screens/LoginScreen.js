/**
 * CodeBlooms Mobile — LoginScreen
 *
 * Kullanıcı giriş ekranı.
 * API: src/api/api.js → loginUser
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { loginUser } from '../api/api';

// ---------------------------------------------------------------------------
// Sabitler
// ---------------------------------------------------------------------------

const COLORS = {
  cream: '#F5F0E8',
  beige: '#EDE8DE',
  bordeaux: '#7B1C3E',
  text: '#1A1A1A',
  white: '#FFFFFF',
  placeholder: '#9E9E9E',
  border: '#C8C0B0',
};

// ---------------------------------------------------------------------------
// Bileşen
// ---------------------------------------------------------------------------

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  // ── Giriş yap ─────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });
      // Başarılı → Home ekranına yönlendir, geri tuşuyla auth'a dönülmesin
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (_err) {
      // Hata alert'i api.js'teki handleError tarafından zaten gösterilir
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.keyboardWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo / Başlık ── */}
        <View style={styles.headerArea}>
          <Text style={styles.logo}>🌸</Text>
          <Text style={styles.brand}>CodeBlooms</Text>
          <Text style={styles.tagline}>Sevdiklerine en güzel çiçekleri gönder</Text>
        </View>

        {/* ── Form ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hoş Geldiniz</Text>
          <Text style={styles.cardSubtitle}>Hesabınıza giriş yapın</Text>

          {/* E-posta */}
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@email.com"
            placeholderTextColor={COLORS.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* Şifre */}
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="Şifrenizi girin"
            placeholderTextColor={COLORS.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* Giriş Yap Butonu */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Alt Yönlendirme ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// StyleSheet
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: COLORS.cream,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  headerArea: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.bordeaux,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 6,
    opacity: 0.6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // ── Kart ────────────────────────────────────────────────────────────────
  card: {
    width: '100%',
    backgroundColor: COLORS.beige,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.bordeaux,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: 8,
  },

  // ── Form Elemanları ─────────────────────────────────────────────────────
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 48,
  },

  // ── Buton ───────────────────────────────────────────────────────────────
  button: {
    backgroundColor: COLORS.bordeaux,
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: COLORS.bordeaux,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Alt Link ────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.bordeaux,
    textDecorationLine: 'underline',
  },
});
