import React, { useEffect, useRef } from 'react';
import {
  Box,
  Group,
  Text,
  ActionIcon,
  Slider,
  NumberInput,
  Button,
} from '@mantine/core';
import {
  IconPlay,
  IconPause,
  IconStop,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconKeyframe,
} from '@tabler/icons-react';
import { useAppStore } from '../store/appStore';

export const Timeline: React.FC = () => {
  const {
    currentProject,
    currentTime,
    isPlaying,
    selectedShapeIds,
    setCurrentTime,
    play,
    pause,
    stop,
    addKeyframe,
  } = useAppStore();

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isPlaying && currentProject) {
      const animate = (timestamp: number) => {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = timestamp;
        }

        const deltaTime = timestamp - lastTimeRef.current;
        const newTime = currentTime + deltaTime;

        if (newTime >= currentProject.duration) {
          setCurrentTime(0);
          pause();
        } else {
          setCurrentTime(newTime);
        }

        lastTimeRef.current = timestamp;

        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = 0;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, currentProject, setCurrentTime, pause]);

  if (!currentProject) {
    return (
      <Box p="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text c="dimmed">プロジェクトが読み込まれていません</Text>
      </Box>
    );
  }

  const handleTimeChange = (value: number) => {
    setCurrentTime(value);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 1000));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(currentProject.duration, currentTime + 1000));
  };

  const handleAddKeyframe = () => {
    if (selectedShapeIds.length === 1) {
      const selectedShape = currentProject.shapes.find(s => s.id === selectedShapeIds[0]);
      if (selectedShape) {
        addKeyframe(selectedShape.id, currentTime, {
          x: selectedShape.x,
          y: selectedShape.y,
          rotation: selectedShape.rotation,
          scaleX: selectedShape.scaleX,
          scaleY: selectedShape.scaleY,
          opacity: selectedShape.opacity,
        });
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const frames = Math.floor((ms % 1000) / (1000 / currentProject.fps));
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
  };

  const timelineMarks = [
    { value: 0, label: '0s' },
    { value: currentProject.duration / 4, label: `${currentProject.duration / 4000}s` },
    { value: currentProject.duration / 2, label: `${currentProject.duration / 2000}s` },
    { value: (currentProject.duration * 3) / 4, label: `${(currentProject.duration * 3) / 4000}s` },
    { value: currentProject.duration, label: `${currentProject.duration / 1000}s` },
  ];

  return (
    <Box p="md" style={{ borderTop: '1px solid #333' }}>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            onClick={handleSkipBack}
            disabled={currentTime <= 0}
          >
            <IconPlayerSkipBack size={16} />
          </ActionIcon>
          
          <ActionIcon
            variant={isPlaying ? 'filled' : 'subtle'}
            onClick={isPlaying ? pause : play}
            size="lg"
          >
            {isPlaying ? <IconPause size={18} /> : <IconPlay size={18} />}
          </ActionIcon>
          
          <ActionIcon
            variant="subtle"
            onClick={stop}
          >
            <IconStop size={16} />
          </ActionIcon>
          
          <ActionIcon
            variant="subtle"
            onClick={handleSkipForward}
            disabled={currentTime >= currentProject.duration}
          >
            <IconPlayerSkipForward size={16} />
          </ActionIcon>
        </Group>

        <Group gap="md">
          <Text size="sm" c="dimmed">
            {formatTime(currentTime)} / {formatTime(currentProject.duration)}
          </Text>
          
          <Button
            variant="subtle"
            size="sm"
            leftSection={<IconKeyframe size={14} />}
            onClick={handleAddKeyframe}
            disabled={selectedShapeIds.length !== 1}
          >
            キーフレームを追加
          </Button>
        </Group>
      </Group>

      <Box mb="md">
        <Slider
          value={currentTime}
          onChange={handleTimeChange}
          min={0}
          max={currentProject.duration}
          step={1000 / currentProject.fps}
          marks={timelineMarks}
          size="lg"
          styles={{
            track: {
              backgroundColor: '#333',
            },
            bar: {
              backgroundColor: '#4c6ef5',
            },
            thumb: {
              backgroundColor: '#4c6ef5',
              border: '2px solid #ffffff',
            },
          }}
        />
      </Box>

      <Box style={{ position: 'relative', height: '60px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
        <Text size="xs" c="dimmed" p="xs">
          キーフレーム
        </Text>
        
        {currentProject.keyframes.map((keyframe) => {
          const position = (keyframe.time / currentProject.duration) * 100;
          const shape = currentProject.shapes.find(s => s.id === keyframe.shapeId);
          
          return (
            <Box
              key={keyframe.id}
              style={{
                position: 'absolute',
                left: `${position}%`,
                top: '24px',
                width: '8px',
                height: '8px',
                backgroundColor: shape ? '#4c6ef5' : '#666',
                borderRadius: '50%',
                transform: 'translateX(-50%)',
                cursor: 'pointer',
              }}
              onClick={() => setCurrentTime(keyframe.time)}
            />
          );
        })}
        
        <Box
          style={{
            position: 'absolute',
            left: `${(currentTime / currentProject.duration) * 100}%`,
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: '#ff6b6b',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />
      </Box>

      <Group justify="space-between" mt="md">
        <Group gap="md">
          <NumberInput
            label="再生時間 (秒)"
            value={currentProject.duration / 1000}
            onChange={(value) => {
              // TODO: Implement duration update functionality
              // updateProjectDuration(value * 1000);
            }}
            min={1}
            max={60}
            step={0.1}
            precision={1}
            size="sm"
            style={{ width: '120px' }}
          />
          
          <NumberInput
            label="フレームレート"
            value={currentProject.fps}
            onChange={(value) => {
              // TODO: Implement FPS update functionality
              // updateProjectFPS(value);
            }}
            min={12}
            max={60}
            step={1}
            size="sm"
            style={{ width: '80px' }}
          />
        </Group>
        
        <Text size="xs" c="dimmed">
          {currentProject.keyframes.length} keyframes
        </Text>
      </Group>
    </Box>
  );
};