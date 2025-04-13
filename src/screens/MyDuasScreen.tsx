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
import { suggestBestNameForDua, AllahName } from '../data/allahNames';
import { useNavigation } from '@react-navigation/native';

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

interface MyDua {
  id: string;
  text: string;
  tags: string[];
  isForSomeoneElse: boolean;
  personName?: string;
  dateCreated: string;
  completed: boolean;
  dateCompleted?: string;
  suggestedName?: AllahName; // New field for the suggested Allah name
}

const MyDuasScreen = () => {
  const navigation = useNavigation();
  const [myDuas, setMyDuas] = useState<MyDua[]>([]);
  const [filteredDuas, setFilteredDuas] = useState<MyDua[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newDuaText, setNewDuaText] = useState('');
  const [newDuaTags, setNewDuaTags] = useState('');
  const [isForSomeoneElse, setIsForSomeoneElse] = useState(false);
  const [personName, setPersonName] = useState('');
  const [editingDua, setEditingDua] = useState<MyDua | null>(null);

  // Load saved duas from storage on component mount
  useEffect(() => {
    loadDuas();
  }, []);

  // Update filtered duas when search query or my duas change
  useEffect(() => {
    handleSearch(searchQuery);
  }, [myDuas, searchQuery]);

  const loadDuas = async () => {
    try {
      const savedDuas = await AsyncStorage.getItem('myDuas');
      if (savedDuas) {
        const parsedDuas = JSON.parse(savedDuas) as MyDua[];
        setMyDuas(parsedDuas);
      }
    } catch (error) {
      console.error('Failed to load duas:', error);
      Alert.alert('Error', 'Failed to load your saved duas');
    }
  };

  const saveDuas = async (duasToSave: MyDua[]) => {
    try {
      await AsyncStorage.setItem('myDuas', JSON.stringify(duasToSave));
    } catch (error) {
      console.error('Failed to save duas:', error);
      Alert.alert('Error', 'Failed to save your duas');
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredDuas(myDuas);
      return;
    }

    const filtered = myDuas.filter(dua => 
      dua.text.toLowerCase().includes(text.toLowerCase()) ||
      dua.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase())) ||
      (dua.personName && dua.personName.toLowerCase().includes(text.toLowerCase()))
    );
    setFilteredDuas(filtered);
  };

  const handleAddOrUpdateDua = () => {
    if (newDuaText.trim() === '') {
      Alert.alert('Error', 'Please enter a dua');
      return;
    }

    const tagsArray = newDuaTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    // Get the suggested name for this dua using AI
    const suggestedName = suggestBestNameForDua(newDuaText);

    if (editingDua) {
      // Update existing dua
      const updatedDuas = myDuas.map(dua => {
        if (dua.id === editingDua.id) {
          return {
            ...dua,
            text: newDuaText,
            tags: tagsArray,
            isForSomeoneElse,
            personName: isForSomeoneElse ? personName : undefined,
            suggestedName: suggestedName // Update the suggested name
          };
        }
        return dua;
      });
      
      setMyDuas(updatedDuas);
      saveDuas(updatedDuas);
    } else {
      // Add new dua
      const newDua: MyDua = {
        id: Date.now().toString(),
        text: newDuaText,
        tags: tagsArray,
        isForSomeoneElse,
        personName: isForSomeoneElse ? personName : undefined,
        dateCreated: new Date().toISOString(),
        completed: false,
        suggestedName: suggestedName // Add the suggested name
      };

      const updatedDuas = [...myDuas, newDua];
      setMyDuas(updatedDuas);
      saveDuas(updatedDuas);
    }

    // Reset form
    setNewDuaText('');
    setNewDuaTags('');
    setIsForSomeoneElse(false);
    setPersonName('');
    setEditingDua(null);
    setModalVisible(false);
  };

  const handleDeleteDua = (id: string) => {
    Alert.alert(
      'Delete Dua',
      'Are you sure you want to delete this dua?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedDuas = myDuas.filter(dua => dua.id !== id);
            setMyDuas(updatedDuas);
            saveDuas(updatedDuas);
          },
        },
      ]
    );
  };

  const handleToggleCompletion = (id: string) => {
    const updatedDuas = myDuas.map(dua => {
      if (dua.id === id) {
        return {
          ...dua,
          completed: !dua.completed,
          dateCompleted: !dua.completed ? new Date().toISOString() : undefined,
        };
      }
      return dua;
    });
    
    setMyDuas(updatedDuas);
    saveDuas(updatedDuas);
  };

  const handleEditDua = (dua: MyDua) => {
    setEditingDua(dua);
    setNewDuaText(dua.text);
    setNewDuaTags(dua.tags.join(', '));
    setIsForSomeoneElse(dua.isForSomeoneElse);
    setPersonName(dua.personName || '');
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
          onPress={() => handleDeleteDua(id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderDuaItem = ({ item }: { item: MyDua }) => (
    <GestureHandlerRootView>
      <Swipeable
        renderRightActions={(progress, dragX) => 
          renderRightActions(progress, dragX, item.id)
        }
      >
        <TouchableOpacity 
          style={[
            styles.duaCard, 
            item.completed && styles.completedDuaCard
          ]}
          onLongPress={() => handleEditDua(item)}
        >
          <View style={styles.duaHeader}>
            <Text style={styles.duaText}>{item.text}</Text>
            <TouchableOpacity 
              onPress={() => handleToggleCompletion(item.id)}
              style={[
                styles.completionButton,
                item.completed ? styles.completedButton : {}
              ]}
            >
              <Ionicons 
                name={item.completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={item.completed ? THEME.success : THEME.gray} 
              />
            </TouchableOpacity>
          </View>
          
          {item.isForSomeoneElse && item.personName && (
            <View style={styles.personContainer}>
              <Ionicons name="person-outline" size={16} color={THEME.primary} />
              <Text style={styles.personText}>For {item.personName}</Text>
            </View>
          )}
          
          {/* Display the suggested Allah name */}
          {item.suggestedName && (
            <TouchableOpacity 
              style={styles.suggestedNameContainer}
              onPress={() => navigation.navigate('Names', { 
                selectedNameTransliteration: item.suggestedName?.transliteration 
              })}
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.suggestedNameText}>
                Suggested name: <Text style={styles.nameHighlight}>{item.suggestedName.transliteration}</Text>
                <Text style={styles.nameMeaning}> ({item.suggestedName.meaning})</Text>
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              Created: {new Date(item.dateCreated).toLocaleDateString()}
            </Text>
            {item.completed && item.dateCompleted && (
              <Text style={styles.completedDateText}>
                Completed: {new Date(item.dateCompleted).toLocaleDateString()}
              </Text>
            )}
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
          placeholder="Search duas by text or tags..."
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
        data={filteredDuas}
        renderItem={renderDuaItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.duasList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={48} color={THEME.gray} />
            <Text style={styles.emptyText}>No saved duas yet</Text>
            <Text style={styles.emptySubText}>Tap the + button to add your first dua</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingDua(null);
          setNewDuaText('');
          setNewDuaTags('');
          setIsForSomeoneElse(false);
          setPersonName('');
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Add/Edit Dua Modal */}
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
                {editingDua ? 'Edit Dua' : 'Add New Dua'}
              </Text>
              
              <Text style={styles.inputLabel}>Your Dua</Text>
              <TextInput
                style={[styles.input, styles.duaInput]}
                placeholder="E.g., Oh Allah, grant me strength and patience to overcome my challenges and bless me with Your guidance."
                value={newDuaText}
                onChangeText={setNewDuaText}
                multiline
                textAlignVertical="top"
                numberOfLines={6}
              />
              
              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., health, family, work"
                value={newDuaTags}
                onChangeText={setNewDuaTags}
              />
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setIsForSomeoneElse(!isForSomeoneElse)}
                >
                  <View style={[styles.checkboxInner, isForSomeoneElse && styles.checkboxChecked]}>
                    {isForSomeoneElse && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>This dua is for someone else</Text>
              </View>
              
              {isForSomeoneElse && (
                <>
                  <Text style={styles.inputLabel}>Person's Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter name..."
                    value={personName}
                    onChangeText={setPersonName}
                  />
                </>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddOrUpdateDua}
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
  duasList: {
    padding: 8,
    paddingBottom: 80, // Extra padding at bottom for add button
  },
  duaCard: {
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
  completedDuaCard: {
    borderLeftColor: THEME.success,
    opacity: 0.8,
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  duaText: {
    flex: 1,
    fontSize: 16,
    color: THEME.text,
    lineHeight: 24,
    marginRight: 8,
  },
  completionButton: {
    padding: 4,
  },
  completedButton: {
    opacity: 1,
  },
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  personText: {
    fontSize: 14,
    color: THEME.primary,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  // New styles for suggested name
  suggestedNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  suggestedNameText: {
    fontSize: 14,
    color: THEME.text,
    marginLeft: 6,
  },
  nameHighlight: {
    fontWeight: '600',
    color: '#8C6D1F',
  },
  nameMeaning: {
    fontStyle: 'italic',
    color: THEME.text,
    fontSize: 13,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagBadge: {
    backgroundColor: THEME.categoryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: THEME.primary,
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
  completedDateText: {
    fontSize: 12,
    color: THEME.success,
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
  duaInput: {
    height: 120,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxInner: {
    width: 18,
    height: 18,
    borderRadius: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: THEME.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: THEME.text,
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

export default MyDuasScreen;