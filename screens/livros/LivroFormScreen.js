import ItemFormScreen from '../../components/ItemFormScreen';
import { useToast } from '../../context/ToastContext';
import { livrosApi } from '../../resources';

export default function LivroFormScreen({ route, navigation }) {
  const item = route.params?.item ?? null;
  const prefill = route.params?.prefill ?? null;
  const { showAchievements } = useToast();

  async function handleSubmit(data) {
    const saved = item ? await livrosApi.update(item.id, data) : await livrosApi.create(data);
    showAchievements(saved.unlocked_achievements);
    navigation.goBack();
  }

  return (
    <ItemFormScreen
      initialItem={item}
      prefill={prefill}
      itemLabel="Livro"
      type="livros"
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}
