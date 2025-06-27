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
          アニメーション
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          アニメーションを追加するには単一のシェイプを選択してください
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

  const easingOptions = Object.keys(easingFunctions).map(key => {
    const easingTranslations: { [key: string]: string } = {
      'linear': 'リニア',
      'ease-in': 'イーズイン',
      'ease-out': 'イーズアウト',
      'ease-in-out': 'イーズインアウト',
      'ease-in-quad': 'イーズインクアッド',
      'ease-out-quad': 'イーズアウトクアッド',
      'ease-in-out-quad': 'イーズインアウトクアッド',
      'ease-in-cubic': 'イーズインキュービック',
      'ease-out-cubic': 'イーズアウトキュービック',
      'ease-in-out-cubic': 'イーズインアウトキュービック',
      'ease-in-quart': 'イーズインクォート',
      'ease-out-quart': 'イーズアウトクォート',
      'ease-in-out-quart': 'イーズインアウトクォート',
      'ease-in-quint': 'イーズインクイント',
      'ease-out-quint': 'イーズアウトクイント',
      'ease-in-out-quint': 'イーズインアウトクイント',
      'ease-in-sine': 'イーズインサイン',
      'ease-out-sine': 'イーズアウトサイン',
      'ease-in-out-sine': 'イーズインアウトサイン',
      'ease-in-expo': 'イーズインエクスポ',
      'ease-out-expo': 'イーズアウトエクスポ',
      'ease-in-out-expo': 'イーズインアウトエクスポ',
      'ease-in-circ': 'イーズインサーク',
      'ease-out-circ': 'イーズアウトサーク',
      'ease-in-out-circ': 'イーズインアウトサーク',
      'ease-in-back': 'イーズインバック',
      'ease-out-back': 'イーズアウトバック',
      'ease-in-out-back': 'イーズインアウトバック',
      'ease-in-elastic': 'イーズインエラスティック',
      'ease-out-elastic': 'イーズアウトエラスティック',
      'ease-in-out-elastic': 'イーズインアウトエラスティック',
      'ease-in-bounce': 'イーズインバウンス',
      'ease-out-bounce': 'イーズアウトバウンス',
      'ease-in-out-bounce': 'イーズインアウトバウンス',
    };
    
    return {
      value: key,
      label: easingTranslations[key] || key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    };
  });

  return (
    <Box p="md" style={{ height: '100%', overflowY: 'auto' }}>
      <Text size="lg" fw={600} mb="md">
        アニメーション
      </Text>

      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb="xs">
            選択されたシェイプ
          </Text>
          <Text size="sm" c="dimmed" tt="capitalize">
            {selectedShape.type} - {selectedShape.id.substring(0, 8)}
          </Text>
        </div>

        <Divider />

        <Accordion multiple>
          <Accordion.Item value="quick-animations">
            <Accordion.Control icon={<IconSparkles size={16} />}>
              クイックアニメーション
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <Group grow>
                  <Button
                    leftSection={<IconBounce size={16} />}
                    onClick={applyBounceAnimation}
                    variant="light"
                  >
                    バウンス
                  </Button>
                  <Button
                    leftSection={<IconRotate size={16} />}
                    onClick={applyRotationAnimation}
                    variant="light"
                  >
                    回転
                  </Button>
                </Group>
                <Group grow>
                  <Button
                    leftSection={<IconResize size={16} />}
                    onClick={applyScaleAnimation}
                    variant="light"
                  >
                    スケール
                  </Button>
                  <Button
                    leftSection={<IconEyeOff size={16} />}
                    onClick={applyFadeAnimation}
                    variant="light"
                  >
                    フェード
                  </Button>
                </Group>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="animation-settings">
            <Accordion.Control>アニメーション設定</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <NumberInput
                  label="継続時間 (ms)"
                  value={animationSettings.duration}
                  onChange={(value) => setAnimationSettings(prev => ({ ...prev, duration: value || 1000 }))}
                  min={100}
                  max={10000}
                  step={100}
                />

                <Select
                  label="イージング"
                  value={animationSettings.easing}
                  onChange={(value) => setAnimationSettings(prev => ({ ...prev, easing: value || 'ease-in-out' }))}
                  data={easingOptions}
                />

                <Text size="sm" fw={500} mt="md">バウンス設定</Text>
                <NumberInput
                  label="振幅"
                  value={animationSettings.amplitude}
                  onChange={(value) => setAnimationSettings(prev => ({ ...prev, amplitude: value || 50 }))}
                  min={10}
                  max={200}
                />

                <Text size="sm" fw={500} mt="md">回転設定</Text>
                <NumberInput
                  label="回転数"
                  value={animationSettings.rotations}
                  onChange={(value) => setAnimationSettings(prev => ({ ...prev, rotations: value || 1 }))}
                  min={0.5}
                  max={10}
                  step={0.5}
                  precision={1}
                />

                <Text size="sm" fw={500} mt="md">スケール設定</Text>
                <Group grow>
                  <NumberInput
                    label="開始スケール"
                    value={animationSettings.fromScale}
                    onChange={(value) => setAnimationSettings(prev => ({ ...prev, fromScale: value || 1 }))}
                    min={0.1}
                    max={5}
                    step={0.1}
                    precision={1}
                  />
                  <NumberInput
                    label="終了スケール"
                    value={animationSettings.toScale}
                    onChange={(value) => setAnimationSettings(prev => ({ ...prev, toScale: value || 1.5 }))}
                    min={0.1}
                    max={5}
                    step={0.1}
                    precision={1}
                  />
                </Group>

                <Text size="sm" fw={500} mt="md">フェード設定</Text>
                <Group grow>
                  <NumberInput
                    label="開始不透明度"
                    value={animationSettings.fromOpacity}
                    onChange={(value) => setAnimationSettings(prev => ({ ...prev, fromOpacity: value || 1 }))}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                  />
                  <NumberInput
                    label="終了不透明度"
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
            <Accordion.Control>手動キーフレーム</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  現在時刻でシェイプの現在のプロパティを使用してキーフレームを追加します。
                </Text>
                <Button
                  onClick={addCustomKeyframe}
                  variant="outline"
                  fullWidth
                >
                  {Math.round(currentTime / 1000 * 100) / 100}秒でキーフレームを追加
                </Button>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Divider />

        <div>
          <Text size="sm" fw={500} mb="xs">
            現在のキーフレーム
          </Text>
          <Text size="xs" c="dimmed">
            このシェイプのキーフレーム数: {currentProject.keyframes.filter(kf => kf.shapeId === selectedShape.id).length}
          </Text>
        </div>
      </Stack>
    </Box>
  );
};