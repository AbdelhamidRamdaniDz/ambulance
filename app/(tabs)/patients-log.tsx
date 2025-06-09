import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  useColorScheme,
  TextInput,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';
import { Stack, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { mockLogData, PatientLogEntry, CaseStatus } from '../../data/mock';

type FilterControlsProps = {
  activeFilter: 'all' | CaseStatus;
  setActiveFilter: (filter: 'all' | CaseStatus) => void;
  activeSort: 'newest' | 'oldest';
  setActiveSort: (sort: 'newest' | 'oldest') => void;
  theme: typeof COLORS.light;
};

type EmptyStateProps = {
  onReset: () => void;
  theme: typeof COLORS.light;
};

type PatientAvatarProps = {
  patientName: string;
  theme: typeof COLORS.light;
};

const FilterControls = ({ activeFilter, setActiveFilter, activeSort, setActiveSort, theme }: FilterControlsProps) => (
  <View style={styles.controlsContainer}>
    <View style={styles.filterContainer}>
      {[
        { key: 'all', label: 'الكل', icon: 'view-list' },
        { key: 'completed', label: 'مكتمل', icon: 'check-circle' },
        { key: 'rejected', label: 'مرفوض', icon: 'close-circle' }
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFilter === filter.key 
                ? COLORS.accent.primary 
                : theme.card,
              borderColor: activeFilter === filter.key 
                ? COLORS.accent.primary 
                : theme.border,
              ...SHADOWS[theme === COLORS.light ? 'light' : 'dark'].small,
            },
          ]}
          onPress={() => setActiveFilter(filter.key as 'all' | CaseStatus)}
        >
          <MaterialCommunityIcons 
            name={filter.icon as any} 
            size={SIZES.icon.small} 
            color={activeFilter === filter.key ? 'white' : theme.textSecondary}
            style={{ marginLeft: SIZES.base / 2 }}
          />
          <Text style={[
            styles.filterText, 
            { color: activeFilter === filter.key ? 'white' : theme.textSecondary }
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <TouchableOpacity 
      style={[
        styles.sortContainer, 
        { backgroundColor: theme.card }
      ]} 
      onPress={() => setActiveSort(activeSort === 'newest' ? 'oldest' : 'newest')}
    >
      <MaterialCommunityIcons 
        name={activeSort === 'newest' ? 'sort-calendar-descending' : 'sort-calendar-ascending'} 
        size={SIZES.icon.medium} 
        color={COLORS.accent.primary} 
      />
      <Text style={[styles.sortText, { color: theme.text }]}>
        {activeSort === 'newest' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
      </Text>
    </TouchableOpacity>
  </View>
);

const EmptyState = ({ onReset, theme }: EmptyStateProps) => (
  <View style={styles.emptyContainer}>
    <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundSecondary }]}>
      <MaterialCommunityIcons 
        name="folder-search-outline" 
        size={SIZES.icon.xlarge * 2} 
        color={theme.textTertiary}
      />
    </View>
    <Text style={[styles.emptyTitle, { color: theme.text }]}>لا توجد نتائج</Text>
    <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>حاول تعديل البحث أو الفلاتر للعثور على النتائج المطلوبة.</Text>
    <TouchableOpacity 
      style={[styles.resetButton, { backgroundColor: COLORS.accent.primary }]} 
      onPress={onReset}
    >
      <MaterialCommunityIcons name="refresh" size={SIZES.icon.medium} color="white" />
      <Text style={styles.resetButtonText}>إعادة تعيين الفلاتر</Text>
    </TouchableOpacity>
  </View>
);

const PatientAvatar = ({ patientName, theme }: PatientAvatarProps) => {
  const initials = patientName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const avatarColors = [
    COLORS.accent.primary,
    COLORS.accent.secondary,
    COLORS.roles.hospital,
    COLORS.accent.info,
    COLORS.accent.warning,
  ];
  const colorIndex = patientName.length % avatarColors.length;
  
  return (
    <View style={[
      styles.avatar, 
      { backgroundColor: avatarColors[colorIndex] }
    ]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

export default function PatientsLogScreen() {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme || 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | CaseStatus>('all');
  const [activeSort, setActiveSort] = useState<'newest' | 'oldest'>('newest');

  const filteredAndSortedData = useMemo(() => {
    let data = mockLogData;
    if (activeFilter !== 'all') data = data.filter(item => item.status === activeFilter);
    if (searchQuery) data = data.filter(item => item.patientName.toLowerCase().includes(searchQuery.toLowerCase()));
    data.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return activeSort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return data;
  }, [searchQuery, activeFilter, activeSort]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setActiveSort('newest');
  };

  const renderLogItem = ({ item }: { item: PatientLogEntry }) => {
    const isCompleted = item.status === 'completed';
    const statusColor = isCompleted ? COLORS.status.available : COLORS.status.unavailable;
    const statusBgColor = isCompleted ? COLORS.status.availableLight : COLORS.status.unavailableLight;
    
    return (
      <Link href={`/patient-detail/${item.id}`} asChild>
        <Pressable style={({ pressed }) => [
          styles.logItem,
          {
            backgroundColor: theme.card,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            opacity: pressed ? 0.8 : 1,
          },
        ]}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          
          <View style={styles.logContent}>
            <View style={styles.logHeader}>
              <PatientAvatar patientName={item.patientName} theme={theme} />
              <View style={styles.patientInfo}>
                <Text style={[styles.patientName, { color: theme.text }]} numberOfLines={1}>
                  {item.patientName}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                    {isCompleted ? 'مكتمل' : 'مرفوض'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.logDetails}>
              <View style={styles.metaRow}>
                <View style={styles.metaContainer}>
                  <MaterialCommunityIcons 
                    name="hospital-building" 
                    size={SIZES.icon.small} 
                    color={theme.textSecondary}
                  />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.assignedHospital}
                  </Text>
                </View>
                <View style={styles.metaContainer}>
                  <MaterialCommunityIcons 
                    name="water-opacity" 
                    size={SIZES.icon.small} 
                    color={theme.textSecondary}
                  />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    {item.bloodType}
                  </Text>
                </View>
              </View>
              
              <View style={styles.metaRow}>
                <View style={styles.metaContainer}>
                  <MaterialCommunityIcons 
                    name="calendar-clock" 
                    size={SIZES.icon.small} 
                    color={theme.textSecondary}
                  />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    {item.date}
                  </Text>
                </View>
                <View style={styles.metaContainer}>
                  <MaterialCommunityIcons 
                    name="clipboard-pulse-outline" 
                    size={SIZES.icon.small} 
                    color={theme.textSecondary}
                  />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.condition}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <MaterialCommunityIcons 
            name="chevron-left" 
            size={SIZES.icon.large} 
            color={theme.textTertiary} 
          />
        </Pressable>
      </Link>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'سجل الحالات الطارئة',
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTitleStyle: { color: theme.text, ...FONTS.title },
          headerShadowVisible: true,
        }}
      />
      
      <FlatList
        data={filteredAndSortedData}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: SIZES.medium }} />}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={[
              styles.searchContainer, 
              { 
                backgroundColor: theme.card, 
                borderColor: theme.borderLight,
              }
            ]}>
              <MaterialCommunityIcons 
                name="magnify" 
                size={SIZES.icon.medium} 
                color={theme.textSecondary} 
                style={{ marginRight: SIZES.base }}
              />
              <TextInput
                placeholder="ابحث عن المريض..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons 
                    name="close-circle" 
                    size={SIZES.icon.medium} 
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <FilterControls 
              activeFilter={activeFilter} 
              setActiveFilter={setActiveFilter}
              activeSort={activeSort}
              setActiveSort={setActiveSort}
              theme={theme} 
            />
          </>
        }
        ListEmptyComponent={() => <EmptyState onReset={resetFilters} theme={theme} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.paddingHorizontal,
    paddingBottom: SIZES.large,
  },
  searchContainer: {
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radiusLarge,
    borderWidth: 1,
    marginBottom: SIZES.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { 
    flex: 1, 
    height: 44, 
    ...FONTS.body, 
    textAlign: 'right',
    paddingHorizontal: SIZES.base,
  },
  controlsContainer: {
    marginBottom: SIZES.large,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.base,
    marginBottom: SIZES.medium,
  },
  filterButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radiusLarge,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: { 
    ...FONTS.bodySmall, 
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row-reverse', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    gap: SIZES.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sortText: { 
    ...FONTS.bodySmall, 
    fontWeight: '500',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radiusLarge,
    position: 'relative',
    marginHorizontal: SIZES.padding,
    ...SHADOWS.light.medium,
  },
  logContent: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  logHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  patientInfo: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  logDetails: {
    marginTop: SIZES.base,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  metaContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: SIZES.base / 2,
    flex: 1,
  },
  metaText: {
    ...FONTS.caption,
    fontWeight: '500',
  },
  patientName: {
    ...FONTS.title,
    textAlign: 'right',
    marginBottom: SIZES.base / 2,
  },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.small,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SIZES.base / 2,
  },
  statusBadgeText: {
    ...FONTS.caption,
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    right: 0,
    top: '10%',
    bottom: '10%',
    width: 4,
    borderTopLeftRadius: SIZES.radius,
    borderBottomLeftRadius: SIZES.radius,
  },
  avatar: {
    width: SIZES.avatar.medium, 
    height: SIZES.avatar.medium,
    borderRadius: SIZES.avatar.medium / 2,
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: { 
    ...FONTS.title, 
    color: 'white',
    fontWeight: '700',
  },
  emptyContainer: {
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: SIZES.height / 8,
    paddingHorizontal: SIZES.padding,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  emptyTitle: { 
    ...FONTS.h3, 
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  emptySubtitle: { 
    ...FONTS.body, 
    marginBottom: SIZES.xlarge,
    textAlign: 'center',
    lineHeight: 24,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.radiusLarge,
    gap: SIZES.base,
  },
  resetButtonText: {
    ...FONTS.button,
    color: 'white',
  },
});