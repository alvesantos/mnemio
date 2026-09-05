import CollectionListScreen from '../../components/CollectionListScreen';
import { livrosApi } from '../../resources';

export default function LivrosListScreen({ navigation }) {
  return (
    <CollectionListScreen
      resourceApi={livrosApi}
      itemLabel="Livro"
      emptyLabel="Nenhum livro cadastrado ainda. Toca no + pra adicionar."
      onAddPress={() => navigation.navigate('LivroForm', { item: null })}
      onEditPress={(item) => navigation.navigate('LivroForm', { item })}
    />
  );
}
