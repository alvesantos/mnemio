import ItemFormScreen from '../../components/ItemFormScreen';
import { useToast } from '../../context/ToastContext';
import { MIDIA_TYPES } from './midiaTypes';

export default function MidiaFormScreen({ route, navigation }) {
  const { type, item, prefill } = route.params;
  const config = MIDIA_TYPES[type];
  const { showAchievements } = useToast();

  async function handleSubmit(data) {
    const saved = item ? await config.api.update(item.id, data) : await config.api.create(data);
    showAchievements(saved.unlocked_achievements);
    navigation.goBack();
  }

  return (
    <ItemFormScreen
      initialItem={item}
      prefill={prefill}
      itemLabel={config.label}
      type={type}
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}
