import ItemFormScreen from '../../components/ItemFormScreen';
import { livrosApi } from '../../resources';

export default function LivroFormScreen({ route, navigation }) {
  const item = route.params?.item ?? null;

  async function handleSubmit(data) {
    if (item) {
      await livrosApi.update(item.id, data);
    } else {
      await livrosApi.create(data);
    }
    navigation.goBack();
  }

  return (
    <ItemFormScreen
      initialItem={item}
      itemLabel="Livro"
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}
