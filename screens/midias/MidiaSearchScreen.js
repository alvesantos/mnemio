import MediaSearchScreen from '../../components/MediaSearchScreen';

export default function MidiaSearchScreen({ route, navigation }) {
  const { type } = route.params;

  // replace (e não navigate) para o "voltar" do formulário cair na lista, e
  // não de volta na busca.
  return (
    <MediaSearchScreen
      type={type}
      onPick={(prefill) => navigation.replace('MidiaForm', { type, item: null, prefill })}
      onManual={() => navigation.replace('MidiaForm', { type, item: null })}
    />
  );
}
