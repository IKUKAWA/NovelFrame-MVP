import React from 'react';
import {
  Box,
  Text,
  Stack,
  NumberInput,
  ColorInput,
  TextInput,
  Slider,
  Switch,
  Divider,
  Button,
  Group,
  Tabs,
} from '@mantine/core';
import { IconTrash, IconSettings, IconPlayerPlay } from '@tabler/icons-react';
import { useAppStore } from '../store/appStore';
import { AnimationPanel } from './AnimationPanel';

export const PropertiesPanel: React.FC = () => {
  const {
    currentProject,
    selectedShapeIds,
    updateShape,
    deleteShape,
  } = useAppStore();

  if (!currentProject || selectedShapeIds.length === 0) {
    return (
      <Tabs defaultValue="properties" style={{ height: '100%' }}>
        <Tabs.List>
          <Tabs.Tab value="properties" leftSection={<IconSettings size={14} />}>
            プロパティ
          </Tabs.Tab>
          <Tabs.Tab value="animation" leftSection={<IconPlayerPlay size={14} />}>
            アニメーション
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="properties" pt="md">
          <Box p="md">
            <Text size="sm" c="dimmed" ta="center">
              シェイプを選択してプロパティを編集
            </Text>
          </Box>
        </Tabs.Panel>
        
        <Tabs.Panel value="animation" pt="md">
          <Box p="md">
            <Text size="sm" c="dimmed" ta="center">
              シェイプを選択してアニメーションを追加
            </Text>
          </Box>
        </Tabs.Panel>
      </Tabs>
    );
  }

  if (selectedShapeIds.length > 1) {
    return (
      <Tabs defaultValue="properties" style={{ height: '100%' }}>
        <Tabs.List>
          <Tabs.Tab value="properties" leftSection={<IconSettings size={14} />}>
            プロパティ
          </Tabs.Tab>
          <Tabs.Tab value="animation" leftSection={<IconPlayerPlay size={14} />}>
            アニメーション
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="properties" pt="md">
          <Box p="md">
            <Text size="sm" c="dimmed" ta="center">
              複数のシェイプが選択されています
            </Text>
            <Text size="xs" c="dimmed" ta="center" mt="xs">
              プロパティを編集するには1つのシェイプを選択してください
            </Text>
          </Box>
        </Tabs.Panel>
        
        <Tabs.Panel value="animation" pt="md">
          <Box p="md">
            <Text size="sm" c="dimmed" ta="center">
              複数のシェイプが選択されています
            </Text>
            <Text size="xs" c="dimmed" ta="center" mt="xs">
              アニメーションを追加するには1つのシェイプを選択してください
            </Text>
          </Box>
        </Tabs.Panel>
      </Tabs>
    );
  }

  const selectedShape = currentProject.shapes.find(s => s.id === selectedShapeIds[0]);
  if (!selectedShape) return null;

  const handlePropertyChange = (property: string, value: any) => {
    updateShape(selectedShape.id, { [property]: value });
  };

  const handleDelete = () => {
    deleteShape(selectedShape.id);
  };

  return (
    <Tabs defaultValue="properties" style={{ height: '100%' }}>
      <Tabs.List>
        <Tabs.Tab value="properties" leftSection={<IconSettings size={14} />}>
          プロパティ
        </Tabs.Tab>
        <Tabs.Tab value="animation" leftSection={<IconPlayerPlay size={14} />}>
          アニメーション
        </Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panel value="properties" pt="md">
        <Box p="md" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
          <Group justify="space-between" mb="md">
            <Text size="lg" fw={600}>
              プロパティ
            </Text>
            <Button
              variant="subtle"
              color="red"
              size="sm"
              leftSection={<IconTrash size={14} />}
              onClick={handleDelete}
            >
              削除
            </Button>
          </Group>

      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb="xs">
            タイプ
          </Text>
          <Text size="sm" c="dimmed" tt="capitalize">
            {selectedShape.type}
          </Text>
        </div>

        <Divider />

        <div>
          <Text size="sm" fw={500} mb="xs">
            位置
          </Text>
          <Group grow>
            <NumberInput
              label="X座標"
              value={selectedShape.x}
              onChange={(value) => handlePropertyChange('x', value || 0)}
              step={1}
            />
            <NumberInput
              label="Y座標"
              value={selectedShape.y}
              onChange={(value) => handlePropertyChange('y', value || 0)}
              step={1}
            />
          </Group>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            サイズ
          </Text>
          {selectedShape.type === 'circle' && (
            <NumberInput
              label="半径"
              value={selectedShape.radius || 50}
              onChange={(value) => handlePropertyChange('radius', value || 50)}
              min={1}
              step={1}
            />
          )}
          {(selectedShape.type === 'rectangle') && (
            <Group grow>
              <NumberInput
                label="幅"
                value={selectedShape.width || 100}
                onChange={(value) => handlePropertyChange('width', value || 100)}
                min={1}
                step={1}
              />
              <NumberInput
                label="高さ"
                value={selectedShape.height || 60}
                onChange={(value) => handlePropertyChange('height', value || 60)}
                min={1}
                step={1}
              />
            </Group>
          )}
          {selectedShape.type === 'text' && (
            <NumberInput
              label="フォントサイズ"
              value={selectedShape.fontSize || 24}
              onChange={(value) => handlePropertyChange('fontSize', value || 24)}
              min={8}
              max={200}
              step={1}
            />
          )}
        </div>

        {selectedShape.type === 'text' && (
          <div>
            <TextInput
              label="テキスト"
              value={selectedShape.text || ''}
              onChange={(e) => handlePropertyChange('text', e.target.value)}
            />
            <TextInput
              label="フォントファミリー"
              value={selectedShape.fontFamily || 'Inter'}
              onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
              mt="xs"
            />
          </div>
        )}

        <Divider />

        <div>
          <Text size="sm" fw={500} mb="xs">
            変形
          </Text>
          <NumberInput
            label="回転（度）"
            value={selectedShape.rotation}
            onChange={(value) => handlePropertyChange('rotation', value || 0)}
            step={1}
            mb="xs"
          />
          <Group grow>
            <NumberInput
              label="X方向の拡大率"
              value={selectedShape.scaleX}
              onChange={(value) => handlePropertyChange('scaleX', value || 1)}
              step={0.1}
              min={0.1}
              precision={2}
            />
            <NumberInput
              label="Y方向の拡大率"
              value={selectedShape.scaleY}
              onChange={(value) => handlePropertyChange('scaleY', value || 1)}
              step={0.1}
              min={0.1}
              precision={2}
            />
          </Group>
        </div>

        <Divider />

        <div>
          <Text size="sm" fw={500} mb="xs">
            外観
          </Text>
          <ColorInput
            label="塗りつぶし色"
            value={selectedShape.fill}
            onChange={(value) => handlePropertyChange('fill', value)}
            mb="xs"
          />
          <ColorInput
            label="線の色"
            value={selectedShape.stroke}
            onChange={(value) => handlePropertyChange('stroke', value)}
            mb="xs"
          />
          <NumberInput
            label="線の太さ"
            value={selectedShape.strokeWidth}
            onChange={(value) => handlePropertyChange('strokeWidth', value || 0)}
            min={0}
            step={1}
            mb="xs"
          />
          <div>
            <Text size="sm" mb="xs">
              不透明度: {Math.round(selectedShape.opacity * 100)}%
            </Text>
            <Slider
              value={selectedShape.opacity * 100}
              onChange={(value) => handlePropertyChange('opacity', value / 100)}
              min={0}
              max={100}
              step={1}
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
            />
          </div>
        </div>

        <Divider />

        <div>
          <Switch
            label="表示"
            checked={selectedShape.visible}
            onChange={(e) => handlePropertyChange('visible', e.target.checked)}
          />
        </div>
      </Stack>
        </Box>
      </Tabs.Panel>
      
      <Tabs.Panel value="animation" pt="md">
        <AnimationPanel />
      </Tabs.Panel>
    </Tabs>
  );
};