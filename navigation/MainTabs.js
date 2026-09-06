import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import PerfilScreen from '../screens/PerfilScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LivrosStack from './LivrosStack';
import MidiasStack from './MidiasStack';

const Tab = createBottomTabNavigator();

const ICONS = {
  Início: 'home',
  Livros: 'book',
  Mídias: 'film',
  Perfil: 'person',
  Configurações: 'settings',
};

export default function MainTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: insets.bottom + 16,
          height: 64,
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: 32,
          borderTopWidth: 0,
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 10,
        },
        tabBarItemStyle: {
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIconStyle: {
          height: '100%',
          marginTop: 0,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Livros" component={LivrosStack} />
      <Tab.Screen name="Mídias" component={MidiasStack} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Configurações" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
