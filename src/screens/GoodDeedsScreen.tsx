import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Modal,
  Alert,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

// Modern light blue theme colors (matching the existing app theme)
const THEME = {
  primary: '#4A90E2',
  secondary: '#78B6FF',
  background: '#F7FBFF',
  card: '#FFFFFF',
  text: '#2E4057',
  inputBg: '#F0F6FF',
  borderLight: '#E5EEF9',
  categoryBg: '#E1EFFF',
  success: '#4CAF50',
  danger: '#F44336',
  gray: '#9E9E9E',
};

interface GoodDeed {
  id: string;
  title: string;
  description: string;
  category: string;
  dateCreated: string;
  impact: 'low' | 'medium' | 'high';
}

const GoodDeedsScreen = () => {
  const [goodDeeds, setGoodDeeds] = useState<GoodDeed[]>([]);
  const [filteredDeeds, setFilteredDeeds] = useState<GoodDeed[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newDeedTitle, setNewDeedTitle] = useState('');
  const [newDeedDescription, setNewDeedDescription] = useState('');
  const [newDeedCategory, setNewDeedCategory] = useState('');
  const [newDeedImpact, setNewDeedImpact] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingDeed, setEditingDeed] = useState<GoodDeed | null>(null);

  // Load saved good deeds from storage on component mount
  useEffect(() => {
    loadGoodDeeds();
  }, []);

  // Update filtered deeds when search query or good deeds change
  useEffect(() => {
    handleSearch(searchQuery);
  }, [goodDeeds, searchQuery]);

  const loadGoodDeeds = async () => {
    try {
      const savedDeeds = await AsyncStorage.getItem('goodDeeds');
      if (savedDeeds) {
        const parsedDeeds = JSON.parse(savedDeeds) as GoodDeed[];
        setGoodDeeds(parsedDeeds);
      }
    } catch (error) {
      console.error('Failed to load good deeds:', error);
      Alert.alert('Error', 'Failed to load your saved good deeds');
    }
  };

  const saveGoodDeeds = async (deedsToSave: GoodDeed[]) => {
    try {
      await AsyncStorage.setItem('goodDeeds', JSON.stringify(deedsToSave));
    } catch (error) {
      console.error('Failed to save good deeds:', error);
      Alert.alert('Error', 'Failed to save your good deeds');
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredDeeds(goodDeeds);
      return;
    }

    const filtered = goodDeeds.filter(deed => 
      deed.title.toLowerCase().includes(text.toLowerCase()) ||
      deed.description.toLowerCase().includes(text.toLowerCase()) ||
      deed.category.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredDeeds(filtered);
  };

  const handleAddOrUpdateDeed = () => {
    if (newDeedTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a title for your good deed');
      return;
    }

    if (editingDeed) {
      // Update existing deed
      const updatedDeeds = goodDeeds.map(deed => {
        if (deed.id === editingDeed.id) {
          return {
            ...deed,
            title: newDeedTitle,
            description: newDeedDescription,
            category: newDeedCategory,
            impact: newDeedImpact
          };
        }
        return deed;
      });
      
      setGoodDeeds(updatedDeeds);
      saveGoodDeeds(updatedDeeds);
    } else {
      // Add new deed
      const newDeed: GoodDeed = {
        id: Date.now().toString(),
        title: newDeedTitle,
        description: newDeedDescription,
        category: newDeedCategory,
        dateCreated: new Date().toISOString(),
        impact: newDeedImpact
      };

      const updatedDeeds = [...goodDeeds, newDeed];
      setGoodDeeds(updatedDeeds);
      saveGoodDeeds(updatedDeeds);
    }

    // Reset form
    setNewDeedTitle('');
    setNewDeedDescription('');
    setNewDeedCategory('');
    setNewDeedImpact('medium');
    setEditingDeed(null);
    setModalVisible(false);
  };

  const handleDeleteDeed = (id: string) => {
    Alert.alert(
      'Delete Good Deed',
      'Are you sure you want to delete this good deed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedDeeds = goodDeeds.filter(deed => deed.id !== id);
            setGoodDeeds(updatedDeeds);
            saveGoodDeeds(updatedDeeds);
          },
        },
      ]
    );
  };

  const handleEditDeed = (deed: GoodDeed) => {
    setEditingDeed(deed);
    setNewDeedTitle(deed.title);
    setNewDeedDescription(deed.description);
    setNewDeedCategory(deed.category);
    setNewDeedImpact(deed.impact);
    setModalVisible(true);
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, id: string) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <TouchableOpacity 
          onPress={() => handleDeleteDeed(id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getImpactColor = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'low': return '#8BC34A';
      case 'medium': return '#FFC107';
      case 'high': return '#FF5722';
      default: return '#FFC107';
    }
  };

  const renderDeedItem = ({ item }: { item: GoodDeed }) => (
    <GestureHandlerRootView>
      <Swipeable
        renderRightActions={(progress, dragX) => 
          renderRightActions(progress, dragX, item.id)
        }
      >
        <TouchableOpacity 
          style={[
            styles.deedCard
          ]}
          onLongPress={() => handleEditDeed(item)}
        >
          <View style={styles.deedHeader}>
            <Text style={styles.deedTitle}>{item.title}</Text>
          </View>
          
          {item.description.trim() !== '' && (
            <Text style={styles.deedDescription}>{item.description}</Text>
          )}
          
          <View style={styles.deedDetailsContainer}>
            {item.category.trim() !== '' && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
            
            <View style={[styles.impactBadge, { backgroundColor: getImpactColor(item.impact) + '20' }]}>
              <Text style={[styles.impactText, { color: getImpactColor(item.impact) }]}>
                {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)} Impact
              </Text>
            </View>
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              Created: {new Date(item.dateCreated).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </GestureHandlerRootView>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={THEME.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search good deeds by title or category..."
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
        data={filteredDeeds}
        renderItem={renderDeedItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.deedsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="hand-right-outline" size={48} color={THEME.gray} />
            <Text style={styles.emptyText}>No good deeds recorded yet</Text>
            <Text style={styles.emptySubText}>Tap the + button to add your first good deed</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingDeed(null);
          setNewDeedTitle('');
          setNewDeedDescription('');
          setNewDeedCategory('');
          setNewDeedImpact('medium');
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Add/Edit Good Deed Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingDeed ? 'Edit Good Deed' : 'Add New Good Deed'}
              </Text>
              
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., Helped an elderly neighbor with groceries"
                value={newDeedTitle}
                onChangeText={setNewDeedTitle}
              />
              
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Add details about your good deed..."
                value={newDeedDescription}
                onChangeText={setNewDeedDescription}
                multiline
                textAlignVertical="top"
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., Charity, Family, Community"
                value={newDeedCategory}
                onChangeText={setNewDeedCategory}
              />
              
              <Text style={styles.inputLabel}>Impact Level</Text>
              <View style={styles.impactSelectionContainer}>
                <TouchableOpacity 
                  style={[
                    styles.impactOption, 
                    newDeedImpact === 'low' && styles.selectedImpact,
                    { backgroundColor: newDeedImpact === 'low' ? '#8BC34A20' : '#F5F5F5' }
                  ]}
                  onPress={() => setNewDeedImpact('low')}
                >
                  <Text style={[
                    styles.impactOptionText,
                    newDeedImpact === 'low' && { color: '#8BC34A' }
                  ]}>Low</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.impactOption, 
                    newDeedImpact === 'medium' && styles.selectedImpact,
                    { backgroundColor: newDeedImpact === 'medium' ? '#FFC10720' : '#F5F5F5' }
                  ]}
                  onPress={() => setNewDeedImpact('medium')}
                >
                  <Text style={[
                    styles.impactOptionText,
                    newDeedImpact === 'medium' && { color: '#FFC107' }
                  ]}>Medium</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.impactOption, 
                    newDeedImpact === 'high' && styles.selectedImpact,
                    { backgroundColor: newDeedImpact === 'high' ? '#FF572220' : '#F5F5F5' }
                  ]}
                  onPress={() => setNewDeedImpact('high')}
                >
                  <Text style={[
                    styles.impactOptionText,
                    newDeedImpact === 'high' && { color: '#FF5722' }
                  ]}>High</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddOrUpdateDeed}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

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
  deedsList: {
    padding: 8,
    paddingBottom: 80, // Extra padding at bottom for add button
  },
  deedCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  deedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  deedTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: THEME.text,
    marginRight: 8,
  },
  deedDescription: {
    fontSize: 15,
    color: THEME.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  deedDetailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: THEME.categoryBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: '500',
  },
  impactBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  impactText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: 12,
    color: THEME.gray,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: THEME.gray,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: THEME.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: THEME.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  descriptionInput: {
    height: 100,
  },
  impactSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  impactOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedImpact: {
    borderColor: THEME.primary,
  },
  impactOptionText: {
    fontWeight: '500',
    color: THEME.gray,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: THEME.text,
    fontWeight: '500',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: THEME.primary,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 16,
  },
  deleteAction: {
    backgroundColor: THEME.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
});

export default GoodDeedsScreen;