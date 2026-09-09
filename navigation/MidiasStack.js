import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import MidiasScreen from '../screens/midias/MidiasScreen';
import MidiaFormScreen from '../screens/midias/MidiaFormScreen';
import MidiaSearchScreen from '../screens/midias/MidiaSearchScreen';
import MediaDetailScreen from '../screens/MediaDetailScreen';
import { MIDIA_TYPES } from '../screens/midias/midiaTypes';

const Stack = createNativeStackNavigator();

export default function MidiasStack() {
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
      <Stack.Screen name="MidiasHome" component={MidiasScreen} options={{ title: 'Mídias' }} />
      <Stack.Screen
        name="MidiaSearch"
        component={MidiaSearchScreen}
        options={({ route }) => ({
          title: `Buscar ${MIDIA_TYPES[route.params.type].pluralLabel.toLowerCase()}`,
        })}
      />
      <Stack.Screen
        name="MidiaForm"
        component={MidiaFormScreen}
        options={({ route }) => {
          const config = MIDIA_TYPES[route.params.type];
          return {
            title: route.params.item
              ? `Editar ${config.label.toLowerCase()}`
              : `Novo(a) ${config.label.toLowerCase()}`,
          };
        }}
      />
      <Stack.Screen name="MidiaDetail" component={MediaDetailScreen} options={{ title: 'Detalhe' }} />
    </Stack.Navigator>
  );
}
