import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/Theme';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './config/firebase';
import { createUser } from './config/backend';

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);

  const handleSignUp = async () => {
    // No authentication logic yet, just navigate to dashboard

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await createUser(fullName);
    } catch (error) {
      
    }
    router.replace('/(tabs)');
  };

  const handleLoginInstead = () => {
    router.push('/login');
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleSecureConfirmEntry = () => {
    setSecureConfirmTextEntry(!secureConfirmTextEntry);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Logo and App Name */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="wallet-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>BudgetBuddy</Text>
            <Text style={styles.tagline}>Smart finance management</Text>
          </View>

          {/* Signup Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create Account</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
              />
              <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
                <Ionicons 
                  name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={secureConfirmTextEntry}
              />
              <TouchableOpacity onPress={toggleSecureConfirmEntry} style={styles.eyeIcon}>
                <Ionicons 
                  name={secureConfirmTextEntry ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLoginInstead}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.xxl,
  },
  backButton: {
    marginTop: Spacing.m,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.l,
    marginBottom: Spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.medium,
    marginBottom: Spacing.m,
  },
  appName: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
  },
  formContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    ...Shadow.medium,
  },
  formTitle: {
    fontSize: FontSize.l,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.m,
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginLeft: Spacing.m,
    marginRight: Spacing.s,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: Spacing.s,
    color: Colors.textPrimary,
    fontSize: FontSize.m,
  },
  eyeIcon: {
    padding: Spacing.m,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.m,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadow.small,
  },
  signupButtonText: {
    color: "white",
    fontSize: FontSize.m,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.m,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: FontSize.s,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: FontSize.s,
    fontWeight: 'bold',
  }
});
