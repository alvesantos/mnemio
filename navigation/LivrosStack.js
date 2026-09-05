import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LivrosListScreen from '../screens/livros/LivrosListScreen';
import LivroFormScreen from '../screens/livros/LivroFormScreen';

const Stack = createNativeStackNavigator();

export default function LivrosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LivrosList" component={LivrosListScreen} options={{ title: 'Livros' }} />
      <Stack.Screen
        name="LivroForm"
        component={LivroFormScreen}
        options={({ route }) => ({ title: route.params?.item ? 'Editar livro' : 'Novo livro' })}
      />
    </Stack.Navigator>
  );
}
