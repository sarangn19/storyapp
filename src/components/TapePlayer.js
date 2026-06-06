import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import STORIES from '../constants/stories';

const PlayIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6 4 19 12 6 20 6 4" />
  </svg>
);

const PauseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const NextIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" strokeWidth="3" />
  </svg>
);

const PrevIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" strokeWidth="3" />
  </svg>
);

const WifiIcon = () => (
  <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
    <path d="M1 9.5C3.5 7.5 6.5 6.5 8 6.5C9.5 6.5 12.5 7.5 15 9.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 6.5C5 4.5 7 4 8 4C9 4 11 4.5 13 6.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="10" r="1.5" fill="#888"/>
  </svg>
);

const BatteryIcon = () => (
  <svg width="16" height="10" viewBox="0 0 20 12" fill="none">
    <rect x="1" y="1" width="16" height="10" rx="2" stroke="#888" strokeWidth="1.5"/>
    <rect x="3" y="3" width="12" height="6" rx="1" fill="#888"/>
    <path d="M19 4V8" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function Spools({ isPlaying }) {
  const [angle, setAngle] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setAngle((prev) => (prev + 6) % 360);
      }, 50);
    } else {
      clearInterval(intervalRef.current);
      setAngle(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const spool = (idx) => (
    <View key={idx} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#222', borderWidth: 2, borderColor: '#333', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#555', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#f1c40f' }} />
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: `${angle}deg` }] }}>
        <View style={{ position: 'absolute', width: 4, height: 30, backgroundColor: '#333', borderRadius: 2, top: 13, left: 26 }} />
        <View style={{ position: 'absolute', width: 30, height: 4, backgroundColor: '#333', borderRadius: 2, top: 26, left: 13 }} />
        <View style={{ position: 'absolute', width: 4, height: 30, backgroundColor: '#333', borderRadius: 2, top: 13, left: 26, transform: [{ rotate: '45deg' }] }} />
        <View style={{ position: 'absolute', width: 4, height: 30, backgroundColor: '#333', borderRadius: 2, top: 13, left: 26, transform: [{ rotate: '-45deg' }] }} />
      </View>
    </View>
  );

  return (
    <View style={{ width: '100%', height: 80, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80, position: 'relative' }}>
      <View style={{ position: 'absolute', top: 27, left: 28, right: 28, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#f1c40f', borderStyle: 'dashed' }} />
      {spool(0)}
      {spool(1)}
    </View>
  );
}

export default function TapePlayer({ storyVolume = 0.7 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  const [showLibrary, setShowLibrary] = useState(false);
  const isDraggingRef = useRef(false);
  const soundRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const seekRef = useRef(null);
  const isSeekingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const volumeRef = useRef(storyVolume);
  const autoAdvanceRef = useRef(() => {});
  volumeRef.current = storyVolume;

  const story = STORIES[currentIndex];

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); clearInterval(intervalRef.current); };
  }, []);

  const loadStory = useCallback(async (index, autoPlay = false) => {
    await soundRef.current?.unloadAsync();
    clearInterval(intervalRef.current);
    const { sound } = await Audio.Sound.createAsync(STORIES[index].file, { shouldPlay: autoPlay });
    soundRef.current = sound;
    await sound.setVolumeAsync(volumeRef.current);
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      setDuration(status.durationMillis / 1000);
      setPosition(0);
    }
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        autoAdvanceRef.current();
      }
    });
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, []);

  // Keep auto-advance ref pointing to latest version
  useEffect(() => {
    autoAdvanceRef.current = async () => {
      const nextIdx = (currentIndex + 1) % STORIES.length;
      setCurrentIndex(nextIdx);
      if (isPlaying) {
        await loadStory(nextIdx, true);
      }
    };
  });

  const ensureLoaded = useCallback(async () => {
    await soundRef.current?.unloadAsync();
    clearInterval(intervalRef.current);
    await loadStory(currentIndex, false);
  }, [currentIndex, loadStory]);

  useEffect(() => {
    if (isPlaying) {
      soundRef.current?.playAsync();
      intervalRef.current = setInterval(async () => {
        const status = await soundRef.current?.getStatusAsync();
        if (status?.isLoaded) {
          setPosition(status.positionMillis / 1000);
        }
      }, 250);
    } else {
      soundRef.current?.pauseAsync();
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  useEffect(() => {
    soundRef.current?.setVolumeAsync(storyVolume);
  }, [storyVolume]);

  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      await ensureLoaded();
      setIsPlaying(true);
    }
  }, [isPlaying, ensureLoaded]);

  const handleNext = useCallback(async () => {
    const nextIdx = (currentIndex + 1) % STORIES.length;
    setCurrentIndex(nextIdx);
    await loadStory(nextIdx, isPlaying);
  }, [currentIndex, isPlaying, loadStory]);

  const handlePrev = useCallback(async () => {
    const prevIdx = (currentIndex - 1 + STORIES.length) % STORIES.length;
    setCurrentIndex(prevIdx);
    await loadStory(prevIdx, isPlaying);
  }, [currentIndex, isPlaying, loadStory]);

  const handleSelectStory = useCallback(async (index) => {
    setCurrentIndex(index);
    setShowLibrary(false);
    await loadStory(index, isPlaying);
  }, [isPlaying, loadStory]);

  const handleTouchStart = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top, centerX: rect.width / 2, centerY: rect.height / 2 };
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilt({ x: rotateX, y: rotateY, active: true });
  };

  const handleTouchEnd = (e) => {
    e?.stopPropagation();
    isDraggingRef.current = false;
    setTilt({ x: 0, y: 0, active: false });
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, centerX: rect.width / 2, centerY: rect.height / 2 };
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilt({ x: rotateX, y: rotateY, active: true });
  };

  const handleMouseUp = (e) => {
    e?.stopPropagation();
    isDraggingRef.current = false;
    setTilt({ x: 0, y: 0, active: false });
  };

  const handleMouseLeave = (e) => {
    e?.stopPropagation();
    isDraggingRef.current = false;
    setTilt({ x: 0, y: 0, active: false });
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const [isSeeking, setIsSeeking] = useState(false);

  const seekToPosition = useCallback((clientX) => {
    if (!seekRef.current || !soundRef.current || duration === 0) return;
    const rect = seekRef.current.getBoundingClientRect();
    let fraction = (clientX - rect.left) / rect.width;
    fraction = Math.max(0, Math.min(1, fraction));
    const newPosition = fraction * duration;
    setPosition(newPosition);
    soundRef.current.setPositionAsync(newPosition * 1000);
  }, [duration]);

  const handleSeekStart = useCallback((e) => {
    e.stopPropagation();
    setIsSeeking(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    seekToPosition(clientX);
  }, [seekToPosition]);

  const handleSeekMove = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    seekToPosition(clientX);
  }, [seekToPosition]);

  const handleSeekEnd = useCallback((e) => {
    setIsSeeking(false);
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (!isSeeking) return;
    window.addEventListener('mousemove', handleSeekMove);
    window.addEventListener('mouseup', handleSeekEnd);
    window.addEventListener('touchmove', handleSeekMove, { passive: false });
    window.addEventListener('touchend', handleSeekEnd);
    return () => {
      window.removeEventListener('mousemove', handleSeekMove);
      window.removeEventListener('mouseup', handleSeekEnd);
      window.removeEventListener('touchmove', handleSeekMove);
      window.removeEventListener('touchend', handleSeekEnd);
    };
  }, [isSeeking, handleSeekMove, handleSeekEnd]);

  return (
    <View style={styles.container}>
      <View
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={[styles.device, {
          transform: [
            { perspective: 1000 },
            { rotateX: `${tilt.x}deg` },
            { rotateY: `${tilt.y}deg` },
          ],
          transition: tilt.active ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
        }]}
      >
        <View style={styles.topSection}>
          <View style={styles.screen}>
            <View style={styles.headerRow}>
              <span style={styles.modelLabel}>RTT-01</span>
              <View style={styles.statusIcons}>
                <WifiIcon />
                <BatteryIcon />
              </View>
            </View>
            <View style={styles.titleArea}>
              <Text style={styles.title} numberOfLines={2}>{story.title}</Text>
              <View style={styles.tags}>
                <span style={styles.tag}>Sleep</span>
                <span style={styles.tag}>Story</span>
              </View>
            </View>
            <View style={styles.tapeArea}>
              <Spools isPlaying={isPlaying} />
            </View>
            <View style={styles.timeRow}>
              <span style={styles.timeText}>{formatTime(position)}</span>
              <span style={styles.timeText}>{formatTime(duration)}</span>
            </View>
            <View
              ref={seekRef}
              style={styles.seekContainer}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
            >
              <View style={styles.seekTrack} />
              <View style={[styles.seekFill, { width: `${progress}%` }]} />
              <View style={[styles.seekThumb, { left: `${progress}%` }]} />
            </View>
          </View>
          <View style={styles.rightButtons}>
            <Pressable style={[styles.btn, isPlaying && styles.btnActive]} onPress={handlePlayPause}>
              {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </Pressable>
            <Pressable style={styles.btn} onPress={handleNext}>
              <NextIcon size={18} />
            </Pressable>
            <Pressable style={styles.btn} onPress={handlePrev}>
              <PrevIcon size={18} />
            </Pressable>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.knob}>
            <View style={styles.knobInner}>
              <View style={styles.knobDot} />
            </View>
          </View>
          <View style={[styles.orangePad, styles.disabled]}>
            <View style={styles.screw} />
            <View style={[styles.screw, { top: 4, right: 4, left: 'auto', bottom: 'auto' }]} />
            <View style={[styles.screw, { bottom: 4, left: 4, top: 'auto', right: 'auto' }]} />
            <View style={[styles.screw, { bottom: 4, right: 4, top: 'auto', left: 'auto' }]} />
          </View>
          <DarkPad icon={<LibraryIcon size={16} />} onPress={() => setShowLibrary(true)} />
          <DarkPad disabled />
        </View>
        {/* Glare overlay */}
        <View style={[styles.glare, { opacity: tilt.active ? Math.max(0.1, (tilt.x + tilt.y + 20) / 40) : 0.3 }]} />
      </View>
      {showLibrary && (
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowLibrary(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Story Library</Text>
            <View style={styles.modalList}>
              {STORIES.map((story, index) => (
                <Pressable key={index} style={[styles.modalItem, index === currentIndex && styles.modalItemActive]} onPress={() => handleSelectStory(index)}>
                  <Text style={[styles.modalItemText, index === currentIndex && styles.modalItemTextActive]}>{story.title}</Text>
                  {index === currentIndex && <Text style={styles.modalCheck}>▶</Text>}
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.modalClose} onPress={() => setShowLibrary(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const LibraryIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

function DarkPad({ icon, onPress, disabled }) {
  return (
    <Pressable style={[styles.darkPadOuter, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <View style={styles.darkPadInner}>
        <View style={styles.darkPadRaised}>
          {icon ? <View style={styles.darkPadIcon}>{icon}</View> : <View style={styles.darkPadDot} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  device: {
    backgroundColor: '#1a1c20',
    borderRadius: 24,
    padding: 6,
    width: '100%',
    maxWidth: 380,
    aspectRatio: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  glare: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 24,
    pointerEvents: 'none',
    background: 'linear-gradient(105deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%)',
  },
  topSection: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    marginBottom: 5,
  },
  screen: {
    flex: 3,
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 10,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  titleArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    color: '#eee',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
    flexShrink: 1,
  },
  tags: {
    flexDirection: 'row',
    gap: 3,
  },
  tag: {
    color: '#888',
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  tapeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timeText: {
    color: '#555',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  seekContainer: {
    height: 14,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 2,
    cursor: 'pointer',
  },
  seekTrack: {
    position: 'absolute',
    left: 0, right: 0,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    top: 5.5,
  },
  seekFill: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#f1c40f',
    borderRadius: 2,
    top: 5.5,
    left: 0,
    maxWidth: '100%',
  },
  seekThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f1c40f',
    top: 2,
    marginLeft: -5,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  rightButtons: {
    flex: 1,
    gap: 5,
  },
  btn: {
    flex: 1,
    backgroundColor: '#2a2c30',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  btnActive: {
    backgroundColor: '#222',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomRow: {
    height: '22%',
    flexDirection: 'row',
    gap: 5,
  },
  knob: {
    flex: 1,
    backgroundColor: '#2a2c30',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  knobInner: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#1a1c20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2a2c30',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  knobDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#444',
    position: 'absolute',
    top: 5,
  },
  orangePad: {
    flex: 1,
    backgroundColor: '#2a2c30',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  screw: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    top: 3,
    left: 3,
  },
  darkPadOuter: {
    flex: 1,
  },
  darkPadInner: {
    flex: 1,
    backgroundColor: '#2a2c30',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  darkPadRaised: {
    width: '55%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#2a2c30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  darkPadDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111',
  },
  darkPadIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  darkPadIconActive: {
    color: '#f1c40f',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    backgroundColor: '#1a1c20',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  modalTitle: {
    color: '#f1c40f',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 14,
    textAlign: 'center',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  modalList: {
    gap: 4,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  modalItemActive: {
    backgroundColor: 'rgba(241,196,15,0.1)',
  },
  modalItemText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  modalItemTextActive: {
    color: '#f1c40f',
    fontWeight: '700',
  },
  modalCheck: {
    color: '#f1c40f',
    fontSize: 12,
  },
  modalClose: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2a2c30',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalCloseText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.4,
  },
});
