import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { allahNames, AllahName } from '../data/allahNames';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';

// Define route params type
type AllahNamesRouteParams = {
  selectedNameTransliteration?: string;
};

// Modern light blue theme colors
const THEME = {
  primary: '#4A90E2',
  secondary: '#78B6FF',
  background: '#F7FBFF',
  card: '#FFFFFF',
  text: '#2E4057',
  inputBg: '#F0F6FF',
  borderLight: '#E5EEF9',
  highlight: '#FFEFD5', // Light yellow highlight color
};

const AllahNamesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNames, setFilteredNames] = useState<AllahName[]>(allahNames);
  const [highlightedName, setHighlightedName] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const route = useRoute<RouteProp<Record<string, AllahNamesRouteParams>, string>>();

  // Handle navigation to specific name when route params change
  useEffect(() => {
    if (route.params?.selectedNameTransliteration) {
      const nameToHighlight = route.params.selectedNameTransliteration;
      setHighlightedName(nameToHighlight);
      
      // Find the index of the name to scroll to
      const index = allahNames.findIndex(n => 
        n.transliteration === nameToHighlight
      );
      
      if (index !== -1 && flatListRef.current) {
        // Small delay to ensure the list is rendered
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5, // Center the item
          });
        }, 300);
      }
    }
  }, [route.params]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredNames(allahNames);
      return;
    }

    const filtered = allahNames.filter(name => 
      name.name.toLowerCase().includes(text.toLowerCase()) ||
      name.transliteration.toLowerCase().includes(text.toLowerCase()) ||
      name.meaning.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredNames(filtered);
  };

  const renderNameItem = ({ item, index }: { item: AllahName; index: number }) => (
    <View 
      style={[
        styles.nameCard,
        // Highlight the card if it matches the selected name
        highlightedName === item.transliteration && styles.highlightedCard
      ]}
    >
      <View style={styles.nameHeader}>
        <Text style={styles.arabicName}>{item.name}</Text>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{allahNames.findIndex(name => name.transliteration === item.transliteration) + 1}</Text>
        </View>
      </View>
      <Text style={styles.transliteration}>{item.transliteration}</Text>
      <Text style={styles.meaning}>{item.meaning}</Text>
      <Text style={styles.benefits}>{item.benefits}</Text>
    </View>
  );

  // Handle scroll error for out of range indices
  const handleScrollToIndexFailed = (info: {
    index: number;
    averageItemLength: number;
  }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
        viewPosition: 0.5
      });
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={THEME.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or meaning..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#8096B1"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={THEME.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        ref={flatListRef}
        data={filteredNames}
        renderItem={renderNameItem}
        keyExtractor={item => item.transliteration}
        contentContainerStyle={styles.namesList}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
    marginBottom: 0, // Removed spacing here
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: THEME.inputBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: THEME.text,
  },
  clearButton: {
    marginLeft: 10,
  },
  namesList: {
    padding: 8, // Reduced padding here
  },
  nameCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  highlightedCard: {
    backgroundColor: THEME.highlight,
    borderLeftColor: '#FFB700', // Gold color for highlighted card
    borderLeftWidth: 6,
  },
  nameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  arabicName: {
    fontSize: 24,
    fontWeight: '600',
    color: THEME.text,
  },
  numberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  transliteration: {
    fontSize: 16,
    color: THEME.primary,
    fontWeight: '500',
    marginBottom: 6,
  },
  meaning: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME.text,
    marginBottom: 8,
  },
  benefits: {
    fontSize: 14,
    color: '#778899',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default AllahNamesScreen;