import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CollectionListScreen from '../../components/CollectionListScreen';
import SegmentedControl from '../../components/SegmentedControl';
import { useTheme } from '../../context/ThemeContext';
import { MIDIA_TYPES } from './midiaTypes';

const OPTIONS = [
  { value: 'series', label: 'Séries' },
  { value: 'filmes', label: 'Filmes' },
  { value: 'doramas', label: 'Doramas' },
  { value: 'animes', label: 'Animes' },
];

export default function MidiasScreen({ navigation }) {
  const [activeType, setActiveType] = useState('series');
  const config = MIDIA_TYPES[activeType];
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SegmentedControl options={OPTIONS} value={activeType} onChange={setActiveType} />
      <CollectionListScreen
        key={activeType}
        type={activeType}
        resourceApi={config.api}
        itemLabel={config.label}
        emptyLabel={`Nenhum(a) ${config.pluralLabel.toLowerCase()} cadastrado(a) ainda. Toca no + pra adicionar.`}
        onAddPress={() =>
          config.searchable
            ? navigation.navigate('MidiaSearch', { type: activeType })
            : navigation.navigate('MidiaForm', { type: activeType, item: null })
        }
        onEditPress={(item) => navigation.navigate('MidiaForm', { type: activeType, item })}
        onDetailPress={(item) =>
          navigation.navigate('MidiaDetail', {
            type: activeType,
            id: item.id,
            item,
            editRoute: 'MidiaForm',
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
