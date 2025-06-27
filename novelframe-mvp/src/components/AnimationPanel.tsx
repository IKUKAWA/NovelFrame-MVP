import React from 'react';
import {
  Box,
  Text,
  Stack,
  Group,
  Button,
  NumberInput,
  Select,
  Divider,
  Accordion,
} from '@mantine/core';
import {
  IconBounce,
  IconRotate,
  IconResize,
  IconEye,
  IconEyeOff,
  IconSparkles,
} from '@tabler/icons-react';
import { useAppStore } from '../store/appStore';
import { animationEngine, easingFunctions } from '../utils/animationEngine';

export const AnimationPanel: React.FC = () => {
  const {
    currentProject,
    selectedShapeIds,
    currentTime,
    addKeyframe,
  } = useAppStore();

  const [animationSettings, setAnimationSettings] = React.useState({
    duration: 1000,
    amplitude: 50,
    rotations: 1,
    fromScale: 1,
    toScale: 1.5,
    fromOpacity: 1,
    toOpacity: 0,
    easing: 'ease-in-out',
  });

  if (!currentProject || selectedShapeIds.length !== 1) {
    return (
      <Box p="md">
        <Text size="lg" fw={600} mb="md">
          Animation
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Select a single shape to add animations
        </Text>
      </Box>
    );
  }

  const selectedShape = currentProject.shapes.find(s => s.id === selectedShapeIds[0]);
  if (!selectedShape) return null;

  const applyBounceAnimation = () => {
    const keyframes = animationEngine.generateBounceAnimation(
      selectedShape.id,
      currentTime,
      animationSettings.duration,
      animationSettings.amplitude
    );
    
    keyframes.forEach(kf => {
      addKeyframe(kf.shapeId, kf.time, kf.properties);
    });
  };

  const applyRotationAnimation = () => {
    const keyframes = animationEngine.generateRotationAnimation(
      selectedShape.id,
      currentTime,
      animationSettings.duration,
      animationSettings.rotations
    );
    
    keyframes.forEach(kf => {
      addKeyframe(kf.shapeId, kf.time, kf.properties);
    });
  };

  const applyScaleAnimation = () => {
    const keyframes = animationEngine.generateScaleAnimation(
      selectedShape.id,
      currentTime,
      animationSettings.duration,
      animationSettings.fromScale,
      animationSettings.toScale
    );
    
    keyframes.forEach(kf => {
      addKeyframe(kf.shapeId, kf.time, kf.properties);
    });
  };

  const applyFadeAnimation = () => {
    const keyframes = animationEngine.generateFadeAnimation(
      selectedShape.id,
      currentTime,
      animationSettings.duration,
      animationSettings.fromOpacity,
      animationSettings.toOpacity
    );
    
    keyframes.forEach(kf => {
      addKeyframe(kf.shapeId, kf.time, kf.properties);
    });
  };

  const addCustomKeyframe = () => {
    addKeyframe(selectedShape.id, currentTime, {
      x: selectedShape.x,
      y: selectedShape.y,
      rotation: selectedShape.rotation,
      scaleX: selectedShape.scaleX,
      scaleY: selectedShape.scaleY,
      opacity: selectedShape.opacity,
    });
  };

  const easingOptions = Object.keys(easingFunctions).map(key => ({
    value: key,
    label: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));

  return (
    <Box p="md" style={{ height: '100%', overflowY: 'auto' }}>
      <Text size="lg" fw={600} mb="md">
        Animation
      </Text>

      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb="xs">
            Selected Shape
          </Text>
          <Text size="sm" c="dimmed" tt="capitalize">
            {selectedShape.type} - {selectedShape.id.substring(0, 8)}
          </Text>
        </div>

        <Divider />

        <Accordion multiple>
          <Accordion.Item value="quick-animations">
            <Accordion.Control icon={<IconSparkles size={16} />}>
              Quick Animations
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <Group grow>
                  <Button
                    leftSection={<IconBounce size={16} />}
                    onClick={applyBounceAnimation}
                    variant="light"
                  >
                    Bounce
                  </Button>
                  <Button
                    leftSection={<IconRotate size={16} />}
                    onClick={applyRotationAnimation}
                    variant="light"
                  >
                    Rotate
                  </Button>
                </Group>
                <Group grow>
                  <Button
                    leftSection={<IconResize size={16} />}
                    onClick={applyScaleAnimation}
                    variant="light"
                  >
                    Scale
                  </Button>
                  <Button
                    leftSection={<IconEyeOff size={16} />}
                    onClick={applyFadeAnimation}
                    variant="light"
                  >
                    Fade
                  </Button>
                </Group>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="animation-settings">
            <Accordion.Control>Animation Settings</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <NumberInput
                  label="Duration (ms)"
                  value={animationSettings.duration}
                  onChange={(value) => setAnimationSettings(prev => ({ ...prev, duration: value || 1000 }))}
                  min={100}
                  max={10000}
                  step={100}
                />

                <Select
                  label="Easing"
                  value={animationSettings.easing}
                  onChange={(value) => setAnimationSettings(prev => ({ ...prev, easing: value || 'ease-in-out' }))}
                  data={easingOptions}
                />

                <Text size="sm" fw={500} mt="md">Bounce Settings</Text>
                <NumberInput
                  label="Amplitude"
                  value={animationSettings.amplitude}
                  onChange={(value) => setAnimationSettings(prev => ({ ...prev, amplitude: value || 50 }))}
                  min={10}
                  max={200}
                />

                <Text size="sm" fw={500} mt="md">Rotation Settings</Text>
                <NumberInput
                  label="Rotations"
                  value={animationSettings.rotations}
                  onChange={(value) => setAnimationSettings(prev => ({ ...prev, rotations: value || 1 }))}
                  min={0.5}
                  max={10}
                  step={0.5}
                  precision={1}
                />

                <Text size="sm" fw={500} mt="md">Scale Settings</Text>
                <Group grow>
                  <NumberInput
                    label="From Scale"
                    value={animationSettings.fromScale}
                    onChange={(value) => setAnimationSettings(prev => ({ ...prev, fromScale: value || 1 }))}
                    min={0.1}
                    max={5}
                    step={0.1}
                    precision={1}
                  />
                  <NumberInput
                    label="To Scale"
                    value={animationSettings.toScale}
                    onChange={(value) => setAnimationSettings(prev => ({ ...prev, toScale: value || 1.5 }))}
                    min={0.1}
                    max={5}
                    step={0.1}
                    precision={1}
                  />
                </Group>

                <Text size="sm" fw={500} mt="md">Fade Settings</Text>
                <Group grow>
                  <NumberInput
                    label="From Opacity"
                    value={animationSettings.fromOpacity}
                    onChange={(value) => setAnimationSettings(prev => ({ ...prev, fromOpacity: value || 1 }))}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                  />
                  <NumberInput
                    label="To Opacity"
                    value={animationSettings.toOpacity}
                    onChange={(value) => setAnimationSettings(prev => ({ ...prev, toOpacity: value || 0 }))}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                  />
                </Group>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="manual-keyframe">
            <Accordion.Control>Manual Keyframe</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  Add a keyframe at the current time with the shape's current properties.
                </Text>
                <Button
                  onClick={addCustomKeyframe}
                  variant="outline"
                  fullWidth
                >
                  Add Keyframe at {Math.round(currentTime / 1000 * 100) / 100}s
                </Button>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Divider />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Current Keyframes
          </Text>
          <Text size="xs" c="dimmed">
            {currentProject.keyframes.filter(kf => kf.shapeId === selectedShape.id).length} keyframes for this shape
          </Text>
        </div>
      </Stack>
    </Box>
  );
};