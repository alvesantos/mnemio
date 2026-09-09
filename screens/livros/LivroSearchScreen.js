import MediaSearchScreen from '../../components/MediaSearchScreen';

export default function LivroSearchScreen({ navigation }) {
  return (
    <MediaSearchScreen
      type="livros"
      onPick={(prefill) => navigation.replace('LivroForm', { item: null, prefill })}
      onManual={() => navigation.replace('LivroForm', { item: null })}
    />
  );
}
