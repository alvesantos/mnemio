import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import PerfilScreen from '../screens/PerfilScreen';
import LivrosStack from './LivrosStack';
import MidiasStack from './MidiasStack';

const Tab = createBottomTabNavigator();

const ICONS = {
  Início: 'home',
  Livros: 'book',
  Mídias: 'film',
  Perfil: 'person',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1a1f3d',
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Livros" component={LivrosStack} />
      <Tab.Screen name="Mídias" component={MidiasStack} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
