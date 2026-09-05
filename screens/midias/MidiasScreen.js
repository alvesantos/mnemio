import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CollectionListScreen from '../../components/CollectionListScreen';
import SegmentedControl from '../../components/SegmentedControl';
import { MIDIA_TYPES } from './midiaTypes';

const OPTIONS = [
  { value: 'series', label: 'Séries' },
  { value: 'filmes', label: 'Filmes' },
  { value: 'animes', label: 'Animes' },
];

export default function MidiasScreen({ navigation }) {
  const [activeType, setActiveType] = useState('series');
  const config = MIDIA_TYPES[activeType];

  return (
    <View style={styles.container}>
      <SegmentedControl options={OPTIONS} value={activeType} onChange={setActiveType} />
      <CollectionListScreen
        key={activeType}
        resourceApi={config.api}
        itemLabel={config.label}
        emptyLabel={`Nenhum(a) ${config.pluralLabel.toLowerCase()} cadastrado(a) ainda. Toca no + pra adicionar.`}
        onAddPress={() => navigation.navigate('MidiaForm', { type: activeType, item: null })}
        onEditPress={(item) => navigation.navigate('MidiaForm', { type: activeType, item })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
