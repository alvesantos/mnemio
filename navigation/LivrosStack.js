import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import LivrosListScreen from '../screens/livros/LivrosListScreen';
import LivroFormScreen from '../screens/livros/LivroFormScreen';

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
        name="LivroForm"
        component={LivroFormScreen}
        options={({ route }) => ({ title: route.params?.item ? 'Editar livro' : 'Novo livro' })}
      />
    </Stack.Navigator>
  );
}
