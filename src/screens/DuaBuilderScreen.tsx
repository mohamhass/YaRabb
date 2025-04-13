import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView as RNSafeAreaView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import data and types
import { allahNames, suggestBestNameForDua, AllahName } from '../data/allahNames';

// Define Good Deed type to match GoodDeedsScreen
interface GoodDeed {
  id: string;
  title: string;
  description: string;
  category: string;
  dateCreated: string;
  impact: 'low' | 'medium' | 'high';
}

// Define MyDua type to match MyDuasScreen
interface MyDua {
  id: string;
  text: string;
  tags: string[];
  isForSomeoneElse: boolean;
  personName?: string;
  dateCreated: string;
  completed: boolean;
  dateCompleted?: string;
  suggestedName?: AllahName;
}

// Modern light blue theme colors
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
  highlight: '#FFEFD5',
  stepActive: '#4A90E2',
  stepInactive: '#D1E5FF',
  stepComplete: '#72BB53',
  highlightText: '#FF8C00',
  danger: '#F44336',
};

const { width, height } = Dimensions.get('window');

const DuaBuilderScreen = () => {
  // State for the selections
  const [selectedName, setSelectedName] = useState<AllahName | null>(null);
  const [selectedDeed, setSelectedDeed] = useState<GoodDeed | null>(null);
  const [selectedMyDua, setSelectedMyDua] = useState<MyDua | null>(null);
  
  // State for good deeds list from storage
  const [goodDeeds, setGoodDeeds] = useState<GoodDeed[]>([]);
  // State for my duas list from storage
  const [myDuas, setMyDuas] = useState<MyDua[]>([]);
  
  // State for showing selector modals
  const [showNameSelector, setShowNameSelector] = useState(false);
  const [showDeedSelector, setShowDeedSelector] = useState(false);
  const [showMyDuaSelector, setShowMyDuaSelector] = useState(false);
  
  // State for the full-screen dua guidance
  const [showGuidance, setShowGuidance] = useState(false);
  
  // Animation values for guidance screen elements
  const nameOpacity = new Animated.Value(0);
  const deedOpacity = new Animated.Value(0);
  const duaOpacity = new Animated.Value(0);
  
  // Load user's saved good deeds and duas on mount
  useEffect(() => {
    loadGoodDeeds();
    loadMyDuas();
  }, []);
  
  // Automatically suggest and set name when a dua is selected
  useEffect(() => {
    if (selectedMyDua) {
      if (selectedMyDua.suggestedName) {
        setSelectedName(selectedMyDua.suggestedName);
      } else {
        const suggestedName = suggestBestNameForDua(selectedMyDua.text);
        setSelectedName(suggestedName);
      }
    }
  }, [selectedMyDua]);
  
  // Load saved good deeds from storage
  const loadGoodDeeds = async () => {
    try {
      const savedDeeds = await AsyncStorage.getItem('goodDeeds');
      if (savedDeeds) {
        const parsedDeeds = JSON.parse(savedDeeds) as GoodDeed[];
        setGoodDeeds(parsedDeeds);
      }
    } catch (error) {
      console.error('Failed to load good deeds:', error);
    }
  };
  
  // Load saved my duas from storage
  const loadMyDuas = async () => {
    try {
      const savedDuas = await AsyncStorage.getItem('myDuas');
      if (savedDuas) {
        const parsedDuas = JSON.parse(savedDuas) as MyDua[];
        setMyDuas(parsedDuas);
      }
    } catch (error) {
      console.error('Failed to load my duas:', error);
    }
  };
  
  // Start guidance when ready
  const startGuidance = () => {
    if (selectedMyDua) {
      setShowGuidance(true);
      startGuidanceAnimation();
    }
  };
  
  // Reset all selections to start over
  const resetBuilder = () => {
    setSelectedName(null);
    setSelectedDeed(null);
    setSelectedMyDua(null);
    setShowGuidance(false);
  };
  
  // Start the sequential fade-in animation for the guidance screen
  const startGuidanceAnimation = () => {
    // Animation has been removed since it was causing visibility issues
    // Content will now always be visible without animations
    
    // Simplified to just show content directly
    nameOpacity.setValue(1);
    deedOpacity.setValue(1);
    duaOpacity.setValue(1);
  };
  
  // Render a single Allah name item for the selector
  const renderNameItem = ({ item }: { item: AllahName }) => (
    <TouchableOpacity
      style={[
        styles.selectorItem,
        selectedName?.transliteration === item.transliteration && styles.selectedItem
      ]}
      onPress={() => {
        setSelectedName(item);
        setShowNameSelector(false);
      }}
    >
      <View style={styles.nameRow}>
        <Text style={styles.arabicName}>{item.name}</Text>
        <Text style={styles.nameTitle}>{item.transliteration}</Text>
      </View>
      <Text style={styles.nameSubtitle}>{item.meaning}</Text>
      <Text style={styles.nameBenefits}>{item.benefits}</Text>
    </TouchableOpacity>
  );
  
  // Render a single Good Deed item for the selector
  const renderDeedItem = ({ item }: { item: GoodDeed }) => (
    <TouchableOpacity
      style={[
        styles.selectorItem,
        selectedDeed?.id === item.id && styles.selectedItem
      ]}
      onPress={() => {
        setSelectedDeed(item);
        setShowDeedSelector(false);
      }}
    >
      <Text style={styles.deedTitle}>{item.title}</Text>
      {item.description.trim() !== '' && (
        <Text style={styles.deedDescription} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={styles.deedDetailsRow}>
        {item.category.trim() !== '' && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
        <View style={styles.impactBadge}>
          <Text style={styles.impactText}>
            {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)} Impact
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Render a single MyDua item for the selector
  const renderMyDuaItem = ({ item }: { item: MyDua }) => (
    <TouchableOpacity
      style={[
        styles.selectorItem,
        selectedMyDua?.id === item.id && styles.selectedItem
      ]}
      onPress={() => {
        setSelectedMyDua(item);
        setShowMyDuaSelector(false);
        
        // Auto-suggest name based on dua or use the stored suggested name
        if (item.suggestedName) {
          setSelectedName(item.suggestedName);
        } else {
          const suggestedName = suggestBestNameForDua(item.text);
          setSelectedName(suggestedName);
        }
      }}
    >
      <Text style={styles.myDuaText}>{item.text}</Text>
      
      {item.isForSomeoneElse && item.personName && (
        <View style={styles.personContainer}>
          <Ionicons name="person-outline" size={16} color={THEME.primary} />
          <Text style={styles.personText}>For {item.personName}</Text>
        </View>
      )}
      
      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Show the suggested name if available */}
      {item.suggestedName && (
        <View style={styles.myDuaSuggestedNameContainer}>
          <Ionicons name="star-outline" size={16} color="#FFD700" />
          <Text style={styles.myDuaSuggestedNameText}>
            {item.suggestedName.transliteration} ({item.suggestedName.meaning})
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  // Render the guidance modal content
  const renderGuidanceContent = () => (
    <View style={styles.guidanceContainer}>
      <RNSafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
        <View style={styles.guidanceHeader}>
          <TouchableOpacity 
            style={styles.closeGuidanceButton}
            onPress={() => setShowGuidance(false)}
          >
            <Ionicons name="close-circle" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={styles.guidanceScrollContent}>
          {/* Step 1: Invoke Allah's name */}
          <View style={styles.guidanceStep}>
            <Text style={styles.guidanceStepTitle}>First, invoke Allah's name:</Text>
            <View style={styles.guidanceNameCard}>
              <Text style={styles.guidanceArabicName}>{selectedName?.name}</Text>
              <Text style={styles.guidanceTransliteration}>{selectedName?.transliteration}</Text>
              <Text style={styles.guidanceMeaning}>{selectedName?.meaning}</Text>
            </View>
          </View>
          
          {/* Step 2: Mention Good Deed (if selected) */}
          {selectedDeed && (
            <View style={styles.guidanceStep}>
              <Text style={styles.guidanceStepTitle}>Then, remember your good deed:</Text>
              <View style={styles.guidanceDeedCard}>
                <Text style={styles.guidanceDeedTitle}>{selectedDeed.title}</Text>
                {selectedDeed.description.trim() !== '' && (
                  <Text style={styles.guidanceDeedDescription}>{selectedDeed.description}</Text>
                )}
              </View>
            </View>
          )}
          
          {/* Step 3: Make the Dua */}
          <View style={styles.guidanceStep}>
            <Text style={styles.guidanceStepTitle}>Finally, make your dua:</Text>
            <View style={styles.guidanceDuaCard}>
              {selectedMyDua && (
                <>
                  <Text style={styles.guidanceMyDuaText}>{selectedMyDua.text}</Text>
                  {selectedMyDua.isForSomeoneElse && selectedMyDua.personName && (
                    <View style={styles.guidancePersonContainer}>
                      <Ionicons name="person-outline" size={16} color={THEME.primary} />
                      <Text style={styles.guidancePersonText}>For {selectedMyDua.personName}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </RNSafeAreaView>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      
      {/* Header Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dua Builder</Text>
        <Text style={styles.headerSubtitle}>Build a personalized dua</Text>
      </View>
      
      {/* Content Area */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* Step 1: Select Dua */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Choose Your Dua</Text>
          </View>
          
          <Text style={styles.instructionText}>
            Select a dua from your saved duas:
          </Text>
          
          {selectedMyDua ? (
            <TouchableOpacity 
              style={styles.selectedItemPreview}
              onPress={() => setShowMyDuaSelector(true)}
            >
              <View style={styles.selectedItemContent}>
                <Text style={styles.previewMyDuaText} numberOfLines={4}>{selectedMyDua.text}</Text>
                {selectedMyDua.isForSomeoneElse && selectedMyDua.personName && (
                  <View style={styles.previewPersonContainer}>
                    <Ionicons name="person-outline" size={16} color={THEME.primary} />
                    <Text style={styles.previewPersonText}>For {selectedMyDua.personName}</Text>
                  </View>
                )}
                {selectedMyDua.tags.length > 0 && (
                  <View style={styles.previewTagsContainer}>
                    {selectedMyDua.tags.slice(0, 3).map((tag, index) => (
                      <View key={index} style={styles.previewTagBadge}>
                        <Text style={styles.previewTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <Ionicons name="pencil-outline" size={24} color={THEME.primary} />
            </TouchableOpacity>
          ) : (
            <View>
              <TouchableOpacity 
                style={styles.selectionButton}
                onPress={() => setShowMyDuaSelector(true)}
              >
                <Ionicons name="add-circle-outline" size={24} color={THEME.primary} />
                <Text style={styles.selectionButtonText}>Select from My Duas</Text>
              </TouchableOpacity>
              
              {myDuas.length === 0 && (
                <Text style={styles.noItemsText}>
                  You have no saved duas. You can add them in the My Duas tab.
                </Text>
              )}
            </View>
          )}
        </View>
        
        {/* Step 2: Allah's Name (auto-suggested) */}
        <View style={[styles.sectionContainer, !selectedMyDua && styles.disabledSection]}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionNumber, !selectedMyDua && styles.disabledSectionNumber]}>
              <Text style={styles.sectionNumberText}>2</Text>
            </View>
            <Text style={[styles.sectionTitle, !selectedMyDua && styles.disabledSectionTitle]}>Allah's Name</Text>
            {selectedMyDua && (
              <View style={styles.autoSuggestedBadge}>
                <Text style={styles.autoSuggestedText}>Auto-suggested</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.instructionText, !selectedMyDua && styles.disabledText]}>
            Name of Allah best suited for your dua:
          </Text>
          
          {selectedName && selectedMyDua ? (
            <TouchableOpacity 
              style={styles.selectedItemPreview}
              onPress={() => setShowNameSelector(true)}
            >
              <View style={styles.selectedItemContent}>
                <Text style={styles.previewArabicName}>{selectedName.name}</Text>
                <Text style={styles.previewNameTitle}>{selectedName.transliteration}</Text>
                <Text style={styles.previewNameMeaning}>{selectedName.meaning}</Text>
                <Text style={styles.previewNameBenefits}>{selectedName.benefits}</Text>
              </View>
              <Ionicons name="pencil-outline" size={24} color={THEME.primary} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.emptyPreviewContainer, !selectedMyDua && styles.disabledEmptyContainer]}>
              <Ionicons name="star-outline" size={32} color={selectedMyDua ? THEME.primary : '#C5D1E5'} />
              <Text style={[styles.emptyPreviewText, !selectedMyDua && styles.disabledText]}>
                Select a dua first to get a suggested name
              </Text>
            </View>
          )}
        </View>
        
        {/* Step 3: Good Deed (Optional) */}
        <View style={[styles.sectionContainer, !selectedMyDua && styles.disabledSection]}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionNumber, !selectedMyDua && styles.disabledSectionNumber]}>
              <Text style={styles.sectionNumberText}>3</Text>
            </View>
            <Text style={[styles.sectionTitle, !selectedMyDua && styles.disabledSectionTitle]}>Good Deed</Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>Optional</Text>
            </View>
          </View>
          
          <Text style={[styles.instructionText, !selectedMyDua && styles.disabledText]}>
            Optionally, select a good deed you have performed:
          </Text>
          
          {selectedDeed && selectedMyDua ? (
            <TouchableOpacity 
              style={styles.selectedItemPreview}
              onPress={() => setShowDeedSelector(true)}
            >
              <View style={styles.selectedItemContent}>
                <Text style={styles.previewDeedTitle}>{selectedDeed.title}</Text>
                {selectedDeed.description.trim() !== '' && (
                  <Text style={styles.previewDeedDescription}>{selectedDeed.description}</Text>
                )}
                {selectedDeed.category.trim() !== '' && (
                  <View style={styles.previewCategoryBadge}>
                    <Text style={styles.previewCategoryText}>{selectedDeed.category}</Text>
                  </View>
                )}
              </View>
              <Ionicons name="pencil-outline" size={24} color={THEME.primary} />
            </TouchableOpacity>
          ) : selectedMyDua ? (
            <TouchableOpacity 
              style={styles.selectionButton}
              onPress={() => setShowDeedSelector(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color={THEME.primary} />
              <Text style={styles.selectionButtonText}>Select a Good Deed</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.emptyPreviewContainer, styles.disabledEmptyContainer]}>
              <Ionicons name="hand-right-outline" size={32} color="#C5D1E5" />
              <Text style={[styles.emptyPreviewText, styles.disabledText]}>
                Select a dua first
              </Text>
            </View>
          )}
          
          {selectedMyDua && goodDeeds.length === 0 && (
            <Text style={styles.noItemsText}>
              You have no saved good deeds. You can add them in the Good Deeds tab.
            </Text>
          )}
        </View>
      </ScrollView>
      
      {/* Start Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !selectedMyDua ? styles.disabledButton : null
          ]}
          onPress={startGuidance}
          disabled={!selectedMyDua}
        >
          <Text style={styles.startButtonText}>Start Dua Guidance</Text>
          <Ionicons name="play-circle" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Name Selector Modal */}
      <Modal
        visible={showNameSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNameSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Name of Allah</Text>
              <TouchableOpacity onPress={() => setShowNameSelector(false)}>
                <Ionicons name="close" size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={allahNames}
              renderItem={renderNameItem}
              keyExtractor={item => item.transliteration}
              contentContainerStyle={styles.modalList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
      
      {/* Good Deed Selector Modal */}
      <Modal
        visible={showDeedSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeedSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Good Deed</Text>
              <TouchableOpacity onPress={() => setShowDeedSelector(false)}>
                <Ionicons name="close" size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>
            
            {goodDeeds.length > 0 ? (
              <FlatList
                data={goodDeeds}
                renderItem={renderDeedItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.modalList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyListContainer}>
                <Ionicons name="hand-right-outline" size={48} color="#B0C4DE" />
                <Text style={styles.emptyListText}>No good deeds recorded yet</Text>
                <Text style={styles.emptyListSubText}>
                  You can add your good deeds in the Good Deeds tab
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* My Dua Selector Modal */}
      <Modal
        visible={showMyDuaSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMyDuaSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select from My Duas</Text>
              <TouchableOpacity onPress={() => setShowMyDuaSelector(false)}>
                <Ionicons name="close" size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>
            
            {myDuas.length > 0 ? (
              <FlatList
                data={myDuas}
                renderItem={renderMyDuaItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.modalList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyListContainer}>
                <Ionicons name="book-outline" size={48} color="#B0C4DE" />
                <Text style={styles.emptyListText}>No saved duas found</Text>
                <Text style={styles.emptyListSubText}>
                  You can add your duas in the My Duas tab
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Full-Screen Dua Guidance Modal */}
      <Modal
        visible={showGuidance}
        animationType="fade"
        transparent={false}
      >
        {renderGuidanceContent()}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
    alignItems: 'center',
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 0, // Remove space after the title
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#78909C',
    marginTop: 0, // Remove space before subtitle
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 4, // Further reduced from 8 to 4
  },
  sectionContainer: {
    marginBottom: 16, // Reduced from 24 to 16
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionNumberText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
  },
  instructionText: {
    fontSize: 16,
    color: THEME.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.card,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.primary,
    borderStyle: 'dashed',
  },
  selectionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME.primary,
    marginLeft: 8,
  },
  selectedItemPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.inputBg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.primary,
    marginBottom: 8,
  },
  selectedItemContent: {
    flex: 1,
    marginRight: 8,
  },
  previewMyDuaText: {
    fontSize: 15,
    color: THEME.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  previewPersonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewPersonText: {
    fontSize: 12,
    color: THEME.primary,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  previewTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewTagBadge: {
    backgroundColor: THEME.categoryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  previewTagText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '500',
  },
  previewArabicName: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
    textAlign: 'right',
  },
  previewNameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
    marginBottom: 4,
  },
  previewNameMeaning: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.text,
    marginBottom: 4,
  },
  previewNameBenefits: {
    fontSize: 14,
    color: '#78909C',
    fontStyle: 'italic',
  },
  previewDeedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
  },
  previewDeedDescription: {
    fontSize: 14,
    color: THEME.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  previewCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.categoryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewCategoryText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '500',
  },
  noItemsText: {
    marginTop: 16,
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
    backgroundColor: THEME.card,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: THEME.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
  },
  modalList: {
    padding: 12,
  },
  selectorItem: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  selectedItem: {
    borderColor: THEME.primary,
    borderWidth: 2,
    backgroundColor: THEME.inputBg,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  arabicName: {
    fontSize: 20,
    color: THEME.text,
    fontWeight: '600',
  },
  nameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
  },
  nameSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.text,
    marginBottom: 6,
  },
  nameBenefits: {
    fontSize: 14,
    color: '#78909C',
    fontStyle: 'italic',
  },
  myDuaText: {
    fontSize: 16,
    color: THEME.text,
    marginBottom: 10,
    lineHeight: 22,
  },
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  personText: {
    fontSize: 14,
    color: THEME.primary,
    marginLeft: 6,
    fontStyle: 'italic',
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
  myDuaSuggestedNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  myDuaSuggestedNameText: {
    fontSize: 13,
    color: '#8C6D1F',
    marginLeft: 6,
    fontWeight: '500',
  },
  deedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
  },
  deedDescription: {
    fontSize: 14,
    color: THEME.text,
    marginBottom: 8,
  },
  deedDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: THEME.categoryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '500',
  },
  impactBadge: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  impactText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '500',
  },
  emptyListContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#78909C',
    marginTop: 16,
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 8,
  },
  guidanceContainer: {
    flex: 1,
    backgroundColor: THEME.primary,
  },
  guidanceHeader: {
    paddingTop: 8,
    paddingHorizontal: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  guidanceScrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  guidanceStep: {
    marginBottom: 30,
  },
  guidanceStepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  guidanceNameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  guidanceArabicName: {
    fontSize: 24,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  guidanceTransliteration: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  guidanceMeaning: {
    fontSize: 16,
    color: THEME.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  guidanceDeedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
  },
  guidanceDeedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  guidanceDeedDescription: {
    fontSize: 14,
    color: THEME.text,
    textAlign: 'center',
  },
  guidanceDuaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
  },
  guidanceMyDuaText: {
    fontSize: 18,
    color: THEME.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
    fontWeight: '500',
  },
  guidancePersonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  guidancePersonText: {
    fontSize: 14,
    color: THEME.primary,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  resetButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
  },
  disabledSection: {
    opacity: 0.7,
  },
  disabledSectionNumber: {
    backgroundColor: '#C5D1E5',
  },
  disabledSectionTitle: {
    color: '#78909C',
  },
  disabledText: {
    color: '#78909C',
  },
  emptyPreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    backgroundColor: THEME.inputBg,
  },
  emptyPreviewText: {
    fontSize: 14,
    color: THEME.text,
    textAlign: 'center',
    marginTop: 8,
  },
  disabledEmptyContainer: {
    borderColor: '#C5D1E5',
    backgroundColor: '#F0F6FF',
  },
  autoSuggestedBadge: {
    backgroundColor: THEME.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  autoSuggestedText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  optionalBadge: {
    backgroundColor: THEME.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  optionalText: {
    fontSize: 12,
    color: THEME.highlightText,
    fontWeight: '500',
  },
});

export default DuaBuilderScreen;