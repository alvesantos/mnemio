import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MidiasScreen from '../screens/midias/MidiasScreen';
import MidiaFormScreen from '../screens/midias/MidiaFormScreen';
import { MIDIA_TYPES } from '../screens/midias/midiaTypes';

const Stack = createNativeStackNavigator();

export default function MidiasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MidiasHome" component={MidiasScreen} options={{ title: 'Mídias' }} />
      <Stack.Screen
        name="MidiaForm"
        component={MidiaFormScreen}
        options={({ route }) => {
          const config = MIDIA_TYPES[route.params.type];
          return { title: route.params.item ? `Editar ${config.label.toLowerCase()}` : `Novo(a) ${config.label.toLowerCase()}` };
        }}
      />
    </Stack.Navigator>
  );
}
