import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  
  // Force re-render when user changes
  const [userState, setUserState] = useState(user);
  
  useEffect(() => {
    setUserState(user);
  }, [user]);

  // Determine which tabs to show based on user role
  const isPetugas = userState?.role === 'petugas';
  const showAllTabs = !isPetugas; // Show all tabs unless explicitly petugas

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="parking"
        options={{
          title: 'Parkir',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="car.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="printer"
        options={{
          title: 'Printer',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="printer" color={color} />,
          tabBarButton: showAllTabs ? HapticTab : () => null, // Hide tab for petugas
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          tabBarButton: showAllTabs ? HapticTab : () => null, // Hide tab for petugas
        }}
      />
    </Tabs>
  );
}
