import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useRive, Layout, Fit, Alignment, LoopType } from '@rive-app/react-canvas';
import TapePlayer from '../components/TapePlayer';
import RainLayer from '../components/RainLayer';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

const VOL_ITEMS = [
  { key: 'fire', icon: '🔥', label: 'Fire' },
  { key: 'rain', icon: '🌧️', label: 'Rain' },
  { key: 'story', icon: '🎵', label: 'Story' },
];

export default function HomeScreen({ navigation }) {
  const [fireStarted, setFireStarted] = useState(false);
  const [rainActive, setRainActive] = useState(false);
  const [rainMounted, setRainMounted] = useState(false);
  const [fireVolume, setFireVolume] = useState(0.5);
  const [rainVolume, setRainVolume] = useState(0.5);
  const [storyVolume, setStoryVolume] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [activeVolume, setActiveVolume] = useState(null);

  const { rive, RiveComponent } = useRive({
    src: require('../../assets/fire.riv'),
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.BottomCenter }),
    autoplay: false,
  });

  const soundRef = useRef(null);
  const rainSoundRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/fire ambiance.mp3'),
        { isLooping: true }
      );
      soundRef.current = sound;
      setLoading(false);
    };
    load();
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const loadRainSound = useCallback(async () => {
    if (rainSoundRef.current) return;
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/rain sound.mp3'),
      { isLooping: true }
    );
    rainSoundRef.current = sound;
  }, []);

  const unloadRainSound = useCallback(async () => {
    await rainSoundRef.current?.unloadAsync();
    rainSoundRef.current = null;
  }, []);

  const handleRainToggle = useCallback(() => {
    setRainActive((prev) => {
      const next = !prev;
      if (next) {
        setRainMounted(true);
        loadRainSound().then(() => {
          rainSoundRef.current?.setPositionAsync(0);
          rainSoundRef.current?.playAsync();
        });
      } else {
        rainSoundRef.current?.stopAsync();
      }
      return next;
    });
  }, [loadRainSound]);

  useEffect(() => {
    if (!rive) return;
    rive.stop();
    if (fireStarted) {
      rive.play('fire start');
      const handler = () => rive.play('fire loop', LoopType.Loop);
      rive.on('stop', handler);
      soundRef.current?.setPositionAsync(0);
      soundRef.current?.playAsync();
      return () => { rive.off('stop', handler); soundRef.current?.stopAsync(); };
    } else {
      rive.play('idle no fire');
      soundRef.current?.stopAsync();
    }
  }, [fireStarted, rive]);

  useEffect(() => {
    soundRef.current?.setVolumeAsync(fireVolume);
  }, [fireVolume]);

  useEffect(() => {
    rainSoundRef.current?.setVolumeAsync(rainVolume);
  }, [rainVolume]);

  const handleScreenPress = useCallback(() => {
    setFireStarted((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <View style={styles.fullBg}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f1c40f" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullBg}>
      <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={handleScreenPress}>
        <View style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          overflow: 'hidden',
        }}>
          <View style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 10 }}>
            <RiveComponent style={{ width: '100%', height: '100%' }} />
          </View>
          {rainMounted && <RainLayer visible={rainActive} />}
        </View>
      </Pressable>
      <View style={styles.headerRow} pointerEvents="box-none">
        <View style={styles.volumeRow}>
          {VOL_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.volButton, activeVolume === item.key && styles.volButtonActive]}
              onPress={() => setActiveVolume(activeVolume === item.key ? null : item.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.volButtonIcon}>{item.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.rainButton, rainActive && styles.rainButtonActive]}
            onPress={handleRainToggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={rainActive ? 'rainy' : 'rainy-outline'}
              size={20}
              color={rainActive ? colors.primary : colors.textDim}
            />
          </TouchableOpacity>
        </View>
      </View>

      {activeVolume && (
        <View style={styles.volPanel}>
          <View style={styles.volPanelArrow} />
          <View style={styles.volPanelContent}>
            <View style={styles.volPanelHeader}>
              <Text style={styles.volPanelLabel}>{VOL_ITEMS.find(v => v.key === activeVolume)?.icon} {VOL_ITEMS.find(v => v.key === activeVolume)?.label}</Text>
              <Text style={styles.volPanelValue}>{Math.round(
                (activeVolume === 'fire' ? fireVolume :
                 activeVolume === 'rain' ? rainVolume :
                 storyVolume) * 100
              )}%</Text>
            </View>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={activeVolume === 'fire' ? fireVolume : activeVolume === 'rain' ? rainVolume : storyVolume}
              onChange={e => {
                const val = parseFloat(e.target.value);
                if (activeVolume === 'fire') setFireVolume(val);
                else if (activeVolume === 'rain') setRainVolume(val);
                else setStoryVolume(val);
              }}
              style={styles.volPanelSlider}
            />
          </View>
          <Pressable style={styles.volPanelBackdrop} onPress={() => setActiveVolume(null)} />
        </View>
      )}

      <View style={styles.playerArea} pointerEvents="box-none">
        <TapePlayer storyVolume={storyVolume} />
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(18,11,36,0.6)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullBg: {
    flex: 1,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    overscrollBehavior: 'none',
    backgroundColor: '#150118',
  },
  headerRow: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  volButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(42,24,72,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  volButtonActive: {
    backgroundColor: 'rgba(241,196,15,0.12)',
    borderColor: 'rgba(241,196,15,0.25)',
  },
  volButtonIcon: {
    fontSize: 15,
  },
  volPanel: {
    position: 'absolute',
    top: 106,
    zIndex: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  volPanelArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1a1c20',
  },
  volPanelContent: {
    backgroundColor: '#1a1c20',
    borderRadius: 14,
    padding: 14,
    width: 200,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  volPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  volPanelLabel: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '600',
  },
  volPanelValue: {
    color: '#f1c40f',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  volPanelSlider: {
    width: '100%',
    height: 24,
    accentColor: '#f1c40f',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    outline: 'none',
  },
  volPanelBackdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: -1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playerArea: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
  },
  rainButton: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(42,24,72,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  rainButtonActive: {
    backgroundColor: 'rgba(255,138,0,0.15)',
    borderColor: 'rgba(255,138,0,0.3)',
  },
  dayBadge: {
    backgroundColor: 'rgba(42,24,72,0.6)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  dayBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.caption,
    color: colors.textDim,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#150118',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 200,
    zIndex: 9,
  },
});
