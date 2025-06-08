// app/(auth)/select-role.tsx
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function SelectRoleScreen() {
  const { setRole } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>اختر دورك</Text>
      <TouchableOpacity style={styles.button} onPress={() => setRole('paramedic')}>
        <Text style={styles.buttonText}>🚑 مسعف</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setRole('hospital')}>
        <Text style={styles.buttonText}>🏥 مستشفى</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40 },
  button: { backgroundColor: '#007AFF', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center', marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});