import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Image,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Landing Screen Component
function LandingScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#3b82f6', '#1e40af']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="heart" size={40} color="white" />
            </View>
            <Text style={styles.title}>Lifebook Health</Text>
            <Text style={styles.subtitle}>
              Your lifetime health record vault—secure, smart, accessible anytime, anywhere.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <FeatureCard
              icon="document-text"
              title="Smart Records"
              description="AI-powered organization of all your medical documents and health data."
            />
            <FeatureCard
              icon="shield-checkmark"
              title="Secure & Private"
              description="Bank-level encryption with HIPAA compliance for your peace of mind."
            />
            <FeatureCard
              icon="people"
              title="Family Health"
              description="Manage health records for your entire family in one secure place."
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

// Dashboard Screen Component
function DashboardScreen() {
  return (
    <SafeAreaView style={styles.dashboardContainer}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Good Morning!</Text>
          <Text style={styles.dashboardSubtitle}>Here's your health overview today</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
            <Ionicons name="heart" size={32} color="white" />
            <Text style={styles.statNumber}>87</Text>
            <Text style={styles.statLabel}>Health Score</Text>
            <Text style={styles.statSubtext}>Excellent condition</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.smallStatCard, { backgroundColor: '#10b981' }]}>
              <Ionicons name="trending-up" size={24} color="white" />
              <Text style={styles.smallStatNumber}>5</Text>
              <Text style={styles.smallStatLabel}>Records</Text>
            </View>
            <View style={[styles.smallStatCard, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="calendar" size={24} color="white" />
              <Text style={styles.smallStatNumber}>3</Text>
              <Text style={styles.smallStatLabel}>Upcoming</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="cloud-upload" size={24} color="#3b82f6" />
            <Text style={styles.actionText}>Upload Record</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="people" size={24} color="#3b82f6" />
            <Text style={styles.actionText}>Family Health</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="shield" size={24} color="#ef4444" />
            <Text style={styles.emergencyTitle}>Emergency Access</Text>
          </View>
          <Text style={styles.emergencyText}>Quick access to critical health information</Text>
          <TouchableOpacity style={styles.emergencyButton}>
            <Text style={styles.emergencyButtonText}>ACTIVATE EMERGENCY MODE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

// Records Screen
function RecordsScreen() {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Health Records</Text>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="document-text" size={60} color="#d1d5db" />
        <Text style={styles.emptyStateTitle}>No Records Yet</Text>
        <Text style={styles.emptyStateText}>Upload your first health record to get started</Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Ionicons name="add-circle" size={20} color="white" style={{marginRight: 8}} />
          <Text style={styles.primaryButtonText}>Upload Record</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Family Screen
function FamilyScreen() {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Family Health</Text>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="people" size={60} color="#d1d5db" />
        <Text style={styles.emptyStateTitle}>No Family Members</Text>
        <Text style={styles.emptyStateText}>Add family members to manage their health records</Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Ionicons name="add-circle" size={20} color="white" style={{marginRight: 8}} />
          <Text style={styles.primaryButtonText}>Add Family Member</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Settings Screen
function SettingsScreen() {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="person" size={24} color="#3b82f6" />
          <Text style={styles.settingsText}>Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="notifications" size={24} color="#3b82f6" />
          <Text style={styles.settingsText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
          <Text style={styles.settingsText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="color-palette" size={24} color="#3b82f6" />
          <Text style={styles.settingsText}>Appearance</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingsItem, {borderBottomWidth: 0}]}>
          <Ionicons name="log-out" size={24} color="#ef4444" />
          <Text style={[styles.settingsText, {color: "#ef4444"}]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Records') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Family') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
      <Tab.Screen name="Family" component={FamilyScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color="#3b82f6" />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  getStartedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  dashboardContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  dashboardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    marginBottom: 32,
  },
  statCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  smallStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  smallStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 8,
  },
  emergencyCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Generic Screen Styles
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenHeader: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Settings Screen
  settingsContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingsText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
    marginLeft: 16,
  },
});