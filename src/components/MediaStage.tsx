import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useEvent } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';

import type { MediaItem } from '@/cloud/types';
import { colors } from '@/theme';

function visiblePlaylist(playlist: MediaItem[]): MediaItem[] {
  return playlist.filter((item) => item.active && !item.deleted);
}

function VideoSlide({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  return (
    <View style={StyleSheet.absoluteFill}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      {status === 'error' ? (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>No se pudo reproducir el video</Text>
        </View>
      ) : null}
    </View>
  );
}

export function MediaStage({ playlist }: { playlist: MediaItem[] }) {
  const active = useMemo(() => visiblePlaylist(playlist), [playlist]);
  const signature = active.map((item) => `${item.id}:${item.seconds}`).join('|');
  const [cursor, setCursor] = useState({ signature: '', index: 0 });
  const index = cursor.signature === signature ? cursor.index : 0;

  useEffect(() => {
    if (active.length === 0) return;
    const current = active[index % active.length];
    const wait = (current?.seconds ?? 12) * 1000;
    const timer = setTimeout(() => {
      setCursor({ signature, index: index + 1 });
    }, wait);
    return () => clearTimeout(timer);
  }, [active, index, signature]);

  const current = active.length > 0 ? active[index % active.length] : undefined;

  return (
    <View style={styles.stage}>
      {current?.kind === 'video' && current.uri ? <VideoSlide uri={current.uri} /> : null}
      {current?.kind === 'image' && current.uri ? (
        <Image source={{ uri: current.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : null}
      {current && (current.kind === 'slide' || (current.kind !== 'video' && !current.uri)) ? (
        <LinearGradient
          colors={[current.accent, '#102028']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <LinearGradient
        colors={['rgba(7,16,24,0.05)', 'rgba(7,16,24,0.82)']}
        style={styles.caption}
      >
        <Text style={styles.kicker}>En pantalla</Text>
        <Text style={styles.title}>{current?.title ?? 'Sin programación'}</Text>
        <Text style={styles.body}>
          {current?.body ?? 'Activa una diapositiva, una imagen o un video desde gestión.'}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    minHeight: 230,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
  },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
  },
  kicker: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  body: {
    color: colors.paper,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  fallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgElevated,
  },
  fallbackText: {
    color: colors.ink,
    fontSize: 16,
  },
});
