import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native'
import { loginUser } from '../api/api'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre zorunludur')
      return
    }
    setLoading(true)
    try {
      await loginUser(email, password)
      navigation.replace('Home')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Giriş başarısız'
      Alert.alert('Hata', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.logo}>🌸</Text>
      <Text style={styles.title}>CodeBlooms</Text>
      <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

      <View style={styles.card}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Şifreniz"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Giriş Yap</Text>
          }
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>
          Hesabın yok mu? <Text style={styles.linkBold}>Kayıt Ol</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  content: { padding: 24, alignItems: 'center' },
  logo: { fontSize: 48, marginTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#7B1C3E', marginTop: 8 },
  subtitle: { fontSize: 16, color: '#1A1A1A', opacity: 0.6, marginBottom: 32 },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#EDE8DE',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#7B1C3E',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 20, fontSize: 14, color: '#1A1A1A', opacity: 0.7 },
  linkBold: { fontWeight: 'bold', color: '#7B1C3E' },
})
