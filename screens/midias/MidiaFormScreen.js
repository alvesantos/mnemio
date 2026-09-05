import ItemFormScreen from '../../components/ItemFormScreen';
import { MIDIA_TYPES } from './midiaTypes';

export default function MidiaFormScreen({ route, navigation }) {
  const { type, item } = route.params;
  const config = MIDIA_TYPES[type];

  async function handleSubmit(data) {
    if (item) {
      await config.api.update(item.id, data);
    } else {
      await config.api.create(data);
    }
    navigation.goBack();
  }

  return (
    <ItemFormScreen
      initialItem={item}
      itemLabel={config.label}
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}
