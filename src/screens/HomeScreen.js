import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useRive, Layout, Fit, Alignment, LoopType } from '@rive-app/react-canvas';
import TapePlayer from '../components/TapePlayer';
import RainLayer from '../components/RainLayer';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

const FireIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" fill="#ff6b6b" />
    <path d="M15 11a3 3 0 11-6 0c0-1.657 1-3 3-5 2 2 3 3.343 3 5z" fill="#ff4500" opacity="0.8" />
  </svg>
);

const RainIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M17 12a5 5 0 0 0-5-5 5 5 0 0 0-5 5h10z" fill="#74b9ff" />
    <path d="M12 5a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3z" fill="#a29bfe" />
    <path d="M19 12a3 3 0 0 0-3-3h.5a2.5 2.5 0 0 0 0-5H16a6 6 0 0 0-11.9 1c-.1 0-.1 0-.2 0a3.5 3.5 0 0 0-.4 6.9V13h15.5z" fill="#dfe6e9" />
    <line x1="8" y1="16" x2="6" y2="20" stroke="#74b9ff" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="17" x2="10" y2="21" stroke="#74b9ff" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="16" x2="14" y2="20" stroke="#74b9ff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MusicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" fill="#a29bfe" />
    <circle cx="18" cy="16" r="3" fill="#a29bfe" />
  </svg>
);


export default function HomeScreen({ navigation }) {
  const [fireStarted, setFireStarted] = useState(false);
  const [rainActive, setRainActive] = useState(false);
  const [rainMounted, setRainMounted] = useState(false);
  const [fireVolume, setFireVolume] = useState(0.5);
  const [rainVolume, setRainVolume] = useState(0.5);
  const [storyVolume, setStoryVolume] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const { rive, RiveComponent } = useRive({
    src: require('../../assets/fire.riv'),
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.BottomCenter }),
    autoplay: false,
  });

  const soundRef = useRef(null);
  const rainSoundRef = useRef(null);
  const thunderSoundRef = useRef(null);

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
    return () => { soundRef.current?.unloadAsync(); rainSoundRef.current?.unloadAsync(); thunderSoundRef.current?.unloadAsync(); };
  }, []);

  const loadRainSound = useCallback(async () => {
    if (rainSoundRef.current) return;
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/rain sound.mp3'),
      { isLooping: true }
    );
    rainSoundRef.current = sound;
  }, []);

  const playThunder = useCallback(async () => {
    try {
      if (thunderSoundRef.current) {
        await thunderSoundRef.current.setPositionAsync(0);
        await thunderSoundRef.current.playAsync();
        return;
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/thunder.mp3'),
        { isLooping: false }
      );
      thunderSoundRef.current = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          thunderSoundRef.current = null;
        }
      });
    } catch (e) {}
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

  // Play thunder on rain start — called from swipe handler outside setState
  const thunderOnRainRef = useRef(false);
  useEffect(() => {
    if (rainActive && !thunderOnRainRef.current) {
      thunderOnRainRef.current = true;
      playThunder();
    } else if (!rainActive) {
      thunderOnRainRef.current = false;
    }
  }, [rainActive, playThunder]);

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

  const SWIPE_THRESHOLD = 60;
  const swipeStartY = useRef(null);
  const isSwiping = useRef(false);
  const suppressMouseRef = useRef(false);

  const handleScreenPress = useCallback(() => {
    if (isSwiping.current) return;
    setFireStarted((prev) => !prev);
  }, []);

  const handleSwipeStart = useCallback((clientY) => {
    swipeStartY.current = clientY;
    isSwiping.current = false;
    setSwipeProgress(0);
  }, []);

  const handleSwipeMove = useCallback((clientY) => {
    if (swipeStartY.current === null) return;
    const dy = clientY - swipeStartY.current;
    if (dy > 0) {
      setSwipeProgress(Math.min(dy / SWIPE_THRESHOLD, 1));
    }
    if (dy > SWIPE_THRESHOLD) {
      isSwiping.current = true;
      swipeStartY.current = null;
      handleRainToggle();
    }
  }, [handleRainToggle]);

  const handleBgTouchStart = useCallback((e) => {
    suppressMouseRef.current = false;
    handleSwipeStart(e.touches[0].clientY);
  }, [handleSwipeStart]);

  const handleBgTouchMove = useCallback((e) => {
    handleSwipeMove(e.touches[0].clientY);
  }, [handleSwipeMove]);

  const handleBgTouchEnd = useCallback(() => {
    suppressMouseRef.current = true;
    setTimeout(() => { suppressMouseRef.current = false; }, 400);
    if (!isSwiping.current) handleScreenPress();
    swipeStartY.current = null;
    isSwiping.current = false;
    setSwipeProgress(0);
  }, [handleScreenPress]);

  const handleBgMouseDown = useCallback((e) => {
    if (suppressMouseRef.current) return;
    handleSwipeStart(e.clientY);
  }, [handleSwipeStart]);

  const handleBgMouseMove = useCallback((e) => {
    if (suppressMouseRef.current) return;
    handleSwipeMove(e.clientY);
  }, [handleSwipeMove]);

  const handleBgMouseUp = useCallback(() => {
    if (suppressMouseRef.current) return;
    if (!isSwiping.current) handleScreenPress();
    swipeStartY.current = null;
    isSwiping.current = false;
    setSwipeProgress(0);
  }, [handleScreenPress]);

  const handleBgMouseLeave = useCallback(() => {
    suppressMouseRef.current = false;
    swipeStartY.current = null;
    isSwiping.current = false;
    setSwipeProgress(0);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = 'body { margin: 0 !important; }';
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
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
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onTouchStart={handleBgTouchStart}
        onTouchMove={handleBgTouchMove}
        onTouchEnd={handleBgTouchEnd}
        onMouseDown={handleBgMouseDown}
        onMouseMove={handleBgMouseMove}
        onMouseUp={handleBgMouseUp}
        onMouseLeave={handleBgMouseLeave}
      >
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          overflow: 'hidden',
        }}>
          <View style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 10 }}>
            <RiveComponent style={{ width: '100%', height: '100%' }} />
          </View>
          {rainMounted && <RainLayer visible={rainActive} />}
        </View>
      </View>
      <View style={[styles.swipeGlow, { opacity: swipeProgress }]} pointerEvents="none" />
      <View style={styles.midSection} pointerEvents="box-none">
        <View style={styles.headerRow}>
          <VolumeStrip label="Fire" value={fireVolume} onChange={setFireVolume} icon={<FireIcon />} activeColor="#ff6b6b" />
          <VolumeStrip label="Rain" value={rainVolume} onChange={setRainVolume} icon={<RainIcon />} activeColor="#74b9ff" />
          <VolumeStrip label="Story" value={storyVolume} onChange={setStoryVolume} icon={<MusicIcon />} activeColor="#a29bfe" />
        </View>
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

const VolumeStrip = ({ label, value, onChange, icon, activeColor }) => {
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const onChangeRef = useRef(onChange);
  const rectRef = useRef({ top: 0, height: 100 });
  onChangeRef.current = onChange;

  const doUpdate = useCallback((clientY) => {
    const { top, height } = rectRef.current;
    if (height <= 0) return;
    const ratio = (top + height - clientY) / height;
    onChangeRef.current(Math.max(0, Math.min(1, ratio)));
  }, []);

  const startDrag = useCallback((clientY) => {
    dragging.current = true;
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      rectRef.current = { top: rect.top, height: rect.height };
    }
    doUpdate(clientY);
  }, [doUpdate]);

  useEffect(() => {
    const onMove = (e) => { if (dragging.current) doUpdate(e.clientY); };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [doUpdate]);

  const pct = Math.round(value * 100);
  const active = value > 0;

  return (
    <View style={stripStyles.container}>
      <View style={[stripStyles.statusDot, { backgroundColor: active ? activeColor : '#2a2a32' }]} />
      <Text style={[stripStyles.label, { color: active ? '#ddd' : '#5a5b67' }]}>{label}</Text>
      <View
        ref={trackRef}
        style={stripStyles.track}
        onTouchStart={(e) => { e.stopPropagation(); startDrag(e.touches[0].clientY); }}
        onTouchMove={(e) => { if (dragging.current) { e.stopPropagation(); doUpdate(e.touches[0].clientY); } }}
        onTouchEnd={() => { dragging.current = false; }}
        onMouseDown={(e) => { e.stopPropagation(); startDrag(e.clientY); }}
      >
        <View style={[stripStyles.fill, { height: `${pct}%`, backgroundColor: active ? activeColor : '#2a2a32' }]} />
        <View style={[stripStyles.knob, { bottom: `calc(${pct}% - 6px)`, borderColor: active ? activeColor : '#3a3a45' }]} />
      </View>
      <View style={stripStyles.iconWrap}>{icon}</View>
    </View>
  );
};

const stripStyles = StyleSheet.create({
  container: {
    width: 52,
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  track: {
    width: 14,
    height: 72,
    backgroundColor: '#151519',
    borderRadius: 7,
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    borderWidth: 1,
    borderColor: '#222',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 7,
  },
  knob: {
    position: 'absolute',
    left: '50%',
    marginLeft: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#25272e',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrap: {
    opacity: 0.85,
  },
});

const styles = StyleSheet.create({
  fullBg: {
    flex: 1,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    overscrollBehavior: 'none',
    backgroundColor: '#150118',
    position: 'relative',
  },
  swipeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 15,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    transition: 'opacity 0.15s ease-out',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  midSection: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
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
