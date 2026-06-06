import React from 'react';
import { View } from 'react-native';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

export default function RainLayer({ visible }) {
  const { RiveComponent } = useRive({
    src: require('../../assets/rain.riv'),
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.BottomCenter }),
    autoplay: true,
  });

  return (
    <View style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 11, opacity: visible ? 0.6 : 0,
      transition: 'opacity 0.6s ease',
    }}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </View>
  );
}
