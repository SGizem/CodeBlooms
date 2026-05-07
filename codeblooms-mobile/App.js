/**
 * CodeBlooms Mobile — Ana Uygulama Girişi
 *
 * Navigasyon: @react-navigation/native-stack
 * Header Teması: Bordo (#7B1C3E) zemin, beyaz başlık ve geri butonu
 *
 * Mevcut ekranlar:
 *   Login, Register, Home, ProductDetail, AdminProducts, MyOrders
 *
 * Not: Eda'nın ekranları sonradan buraya eklenecek.
 */

// ⚠️ Bu import MUTLAKA ilk satırda olmalı — fiziksel cihaz desteği için zorunlu
import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// ---------------------------------------------------------------------------
// Ekran İmportları
// ---------------------------------------------------------------------------

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import AdminProductsScreen from './src/screens/AdminProductsScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';

// ---------------------------------------------------------------------------
// Stack Navigator
// ---------------------------------------------------------------------------

const Stack = createNativeStackNavigator();

/** Tüm stack ekranlarında ortak header ayarları */
const GLOBAL_SCREEN_OPTIONS = {
  headerStyle: {
    backgroundColor: '#7B1C3E', // Bordo
  },
  headerTintColor: '#FFFFFF',        // Geri butonu + başlık rengi
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 18,
  },
  headerBackTitle: 'Geri',
  contentStyle: {
    backgroundColor: '#F5F0E8',      // Krem — sayfa arka planı
  },
  animation: 'slide_from_right',
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <SafeAreaProvider>
      {/* StatusBar bordo zemine uyumlu açık renk */}
      <StatusBar style="light" backgroundColor="#7B1C3E" />

      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={GLOBAL_SCREEN_OPTIONS}
        >
          {/* ── Auth Ekranları ─────────────────────────────────────────── */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Giriş Yap', headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Kayıt Ol', headerShown: false }}
          />

          {/* ── Ana Ekranlar ────────────────────────────────────────────── */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'CodeBlooms 🌸' }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: 'Ürün Detayı' }}
          />

          {/* ── Admin Ekranları ─────────────────────────────────────────── */}
          <Stack.Screen
            name="AdminProducts"
            component={AdminProductsScreen}
            options={{ title: 'Ürün Yönetimi' }}
          />

          {/* ── Kullanıcı Ekranları ─────────────────────────────────────── */}
          <Stack.Screen
            name="MyOrders"
            component={MyOrdersScreen}
            options={{ title: 'Siparişlerim' }}
          />

          {/*
           * 📌 EDA'NIN EKRANLARI BURAYA EKLENECEKTİR
           * Örnek:
           * <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Sepetim' }} />
           */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
