import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Types
type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  registerLoading: boolean;
  loginLoading: boolean;
  error: string | null;
  register: (username: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  registerLoading: false,
  loginLoading: false,
  error: null,
  register: async () => false,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      switch(user.role) {
        case 'teacher':
          router.replace('../teacher-dashboard');
          break;
        case 'admin':
          router.replace('../admin-dashboard');
          break;
        case 'parent':
          router.replace('../parent-dashboard');
          break;
        default:
          router.replace('../student-dashboard');
      }
    }
  }, [user]);

  const register = async (username: string, email: string, password: string, role: UserRole) => {
    setRegisterLoading(true);
    setError(null);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock user
      const newUser: User = {
        id: Math.random().toString(36).substring(7),
        username,
        email,
        role,
      };
      
      setUser(newUser);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setRegisterLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoginLoading(true);
    setError(null);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, just create a mock student user
      const mockUser: User = {
        id: Math.random().toString(36).substring(7),
        username: 'Demo User',
        email,
        role: 'student',
      };
      
      setUser(mockUser);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    router.replace('/');
  };

  const value = useMemo(() => ({
    user,
    registerLoading,
    loginLoading,
    error,
    register,
    login,
    logout,
  }), [user, registerLoading, loginLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// Theme Context
interface ThemeColors {
  background: string;
  text: string;
  subtext: string;
  primary: string;
  border: string;
  inputBackground: string;
  placeholder: string;
  icon: string;
  buttonText: string;
  error: string;
}

const defaultTheme: ThemeColors = {
  background: '#FFFFFF',
  text: '#000000',
  subtext: '#666666',
  primary: '#007AFF',
  border: '#DDDDDD',
  inputBackground: '#FFFFFF',
  placeholder: '#999999',
  icon: '#666666',
  buttonText: '#FFFFFF',
  error: '#DC2626',
};

const ThemeContext = createContext<ThemeColors>(defaultTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={defaultTheme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Signup Screen
type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole | '';
};

const SignupScreen = () => {
  const { register, registerLoading, error } = useAuth();
  const theme = useTheme();
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = useCallback((name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleRoleSelection = useCallback((role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!formData.role) {
      Alert.alert('Error', 'Please select your role');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'You must accept the terms and conditions');
      return false;
    }

    return true;
  }, [formData, acceptTerms]);

  const handleRegister = useCallback(async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) return;

    const success = await register(
      formData.username.trim(),
      formData.email.trim(),
      formData.password,
      formData.role as UserRole
    );
  }, [formData, acceptTerms, register, validateForm]);

  const roleButton = (active: boolean): ViewStyle => ({
    width: '48%',
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: active ? theme.primary : theme.border,
    backgroundColor: active ? theme.primary : 'transparent',
  });

  const roleText = (active: boolean): TextStyle => ({
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: active ? theme.buttonText : theme.text,
  });

  const checkbox = (checked: boolean): ViewStyle => ({
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: checked ? theme.primary : theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: checked ? theme.primary : 'transparent',
  });

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    logoContainer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    logo: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
    },
    header: {
      marginBottom: 24,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.subtext,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: 16,
      zIndex: 1,
    },
    input: {
      flex: 1,
      height: 50,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingLeft: 48,
      paddingRight: 48,
      backgroundColor: theme.inputBackground,
      color: theme.text,
      fontSize: 16,
    },
    eyeButton: {
      position: 'absolute',
      right: 16,
      padding: 10,
    },
    roleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      flexWrap: 'wrap',
      rowGap: 12,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    termsText: {
      color: theme.text,
      fontSize: 14,
      flex: 1,
    },
    termsLink: {
      color: theme.primary,
      textDecorationLine: 'underline',
    },
    registerButton: {
      width: '100%',
      height: 50,
      backgroundColor: theme.primary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      opacity: registerLoading || !acceptTerms ? 0.7 : 1,
    },
    registerButtonText: {
      color: theme.buttonText,
      fontSize: 18,
      fontWeight: '600',
    },
    errorText: {
      color: theme.error,
      fontSize: 14,
      marginBottom: 8,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    footerText: {
      color: theme.text,
      fontSize: 16,
    },
    footerLink: {
      color: theme.primary,
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 6,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/icon.png')} 
                  style={styles.logo} 
                  accessibilityLabel="App logo"
                />
              </View>

              <View style={styles.header}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Please fill in your details</Text>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter Name"
                    value={formData.username}
                    onChangeText={(text) => handleInputChange('username', text)}
                    style={styles.input}
                    placeholderTextColor={theme.placeholder}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="email" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter Email"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    style={styles.input}
                    placeholderTextColor={theme.placeholder}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter Password"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    style={styles.input}
                    placeholderTextColor={theme.placeholder}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <MaterialIcons 
                      name={showPassword ? "visibility" : "visibility-off"} 
                      size={20} 
                      color={theme.icon} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Confirm Password"
                    secureTextEntry={!showConfirmPassword}
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    style={styles.input}
                    placeholderTextColor={theme.placeholder}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <MaterialIcons 
                      name={showConfirmPassword ? "visibility" : "visibility-off"} 
                      size={20} 
                      color={theme.icon} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.roleContainer}>
                {(['student', 'teacher', 'admin', 'parent'] as UserRole[]).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={roleButton(formData.role === role)}
                    onPress={() => handleRoleSelection(role)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons 
                      name={
                        role === 'student' ? 'school' :
                        role === 'teacher' ? 'person' :
                        role === 'admin' ? 'admin-panel-settings' : 'family-restroom'
                      } 
                      size={20} 
                      color={formData.role === role ? theme.buttonText : theme.icon} 
                    />
                    <Text style={roleText(formData.role === role)}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.termsContainer}>
                <TouchableOpacity
                  onPress={() => setAcceptTerms(!acceptTerms)}
                  style={checkbox(acceptTerms)}
                  activeOpacity={0.8}
                >
                  {acceptTerms && (
                    <MaterialIcons name="check" size={16} color={theme.buttonText} />
                  )}
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  I accept the <Text style={styles.termsLink}>Terms & Conditions</Text>
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                style={styles.registerButton}
                disabled={registerLoading || !acceptTerms}
                activeOpacity={0.8}
              >
                {registerLoading ? (
                  <ActivityIndicator color={theme.buttonText} />
                ) : (
                  <Text style={styles.registerButtonText}>Register</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push("../login")}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Login Screen
const LoginScreen = () => {
  const { login, loginLoading, error } = useAuth();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    await login(email, password);
  }, [email, password, login]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    logoContainer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    logo: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
    },
    header: {
      marginBottom: 24,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.subtext,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: 16,
      zIndex: 1,
    },
    input: {
      flex: 1,
      height: 50,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingLeft: 48,
      paddingRight: 48,
      backgroundColor: theme.inputBackground,
      color: theme.text,
      fontSize: 16,
    },
    eyeButton: {
      position: 'absolute',
      right: 16,
      padding: 10,
    },
    loginButton: {
      width: '100%',
      height: 50,
      backgroundColor: theme.primary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    loginButtonText: {
      color: theme.buttonText,
      fontSize: 18,
      fontWeight: '600',
    },
    errorText: {
      color: theme.error,
      fontSize: 14,
      marginBottom: 8,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    footerText: {
      color: theme.text,
      fontSize: 16,
    },
    footerLink: {
      color: theme.primary,
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 6,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/icon.png')} 
                  style={styles.logo} 
                  accessibilityLabel="App logo"
                />
              </View>

              <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="email" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    placeholderTextColor={theme.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    placeholderTextColor={theme.placeholder}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <MaterialIcons 
                      name={showPassword ? "visibility" : "visibility-off"} 
                      size={20} 
                      color={theme.icon} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={loginLoading}
                activeOpacity={0.8}
              >
                {loginLoading ? (
                  <ActivityIndicator color={theme.buttonText} />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.footerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Dashboard Components
const StudentDashboard = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>Student Dashboard</Text>
        <TouchableOpacity onPress={logout} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const TeacherDashboard = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>Teacher Dashboard</Text>
        <TouchableOpacity onPress={logout} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>Admin Dashboard</Text>
        <TouchableOpacity onPress={logout} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ParentDashboard = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>Parent Dashboard</Text>
        <TouchableOpacity onPress={logout} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// App Entry Point
export function App() {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return null; // Navigation is handled by AuthProvider's useEffect
}

// Wrap the app with providers
export function Root() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default SignupScreen;