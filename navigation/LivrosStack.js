import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import LivrosListScreen from '../screens/livros/LivrosListScreen';
import LivroFormScreen from '../screens/livros/LivroFormScreen';
import LivroSearchScreen from '../screens/livros/LivroSearchScreen';
import MediaDetailScreen from '../screens/MediaDetailScreen';

const Stack = createNativeStackNavigator();

export default function LivrosStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.heading },
        headerTintColor: colors.heading,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="LivrosList" component={LivrosListScreen} options={{ title: 'Livros' }} />
      <Stack.Screen
        name="LivroSearch"
        component={LivroSearchScreen}
        options={{ title: 'Buscar livros' }}
      />
      <Stack.Screen
        name="LivroForm"
        component={LivroFormScreen}
        options={({ route }) => ({ title: route.params?.item ? 'Editar livro' : 'Novo livro' })}
      />
      <Stack.Screen name="LivroDetail" component={MediaDetailScreen} options={{ title: 'Livro' }} />
    </Stack.Navigator>
  );
}
