import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

// Import screens
import AllahNamesScreen from '../screens/AllahNamesScreen';
import MyDuasScreen from '../screens/MyDuasScreen';
import GoodDeedsScreen from '../screens/GoodDeedsScreen';
import DuaBuilderScreen from '../screens/DuaBuilderScreen';

// Modern light blue theme colors
const THEME = {
  primary: '#4A90E2',
  secondary: '#78B6FF',
  background: '#F7FBFF',
  inactive: '#B0C4DE',
  text: '#2E4057',
};

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="DuaBuilder"
          screenOptions={{
            tabBarActiveTintColor: THEME.primary,
            tabBarInactiveTintColor: THEME.inactive,
            tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
            tabBarStyle: { 
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              height: Platform.OS === 'ios' ? 88 : 60, // Increased height on iOS to accommodate home indicator
              paddingBottom: Platform.OS === 'ios' ? 30 : 8, // Extra padding at bottom for iOS
              paddingTop: 8,
              backgroundColor: THEME.background,
            },
            headerShown: true,
            headerStyle: {
              backgroundColor: THEME.background,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTitleStyle: {
              color: THEME.text,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen 
            name="DuaBuilder" 
            component={DuaBuilderScreen}
            options={{
              tabBarLabel: "Dua Builder",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="build-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Names" 
            component={AllahNamesScreen}
            options={{
              tabBarLabel: "Allah's Names",
              headerTitle: "The 99 Names of Allah",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bookmarks-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="MyDuas" 
            component={MyDuasScreen}
            options={{
              tabBarLabel: "My Duas",
              headerTitle: "My Saved Duas",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bookmark-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="GoodDeeds" 
            component={GoodDeedsScreen}
            options={{
              tabBarLabel: "Good Deeds",
              headerTitle: "My Good Deeds",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="hand-right-outline" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;