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
            Properties
          </Tabs.Tab>
          <Tabs.Tab value="animation" leftSection={<IconPlayerPlay size={14} />}>
            Animation
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="properties" pt="md">
          <Box p="md">
            <Text size="sm" c="dimmed" ta="center">
              Select a shape to edit its properties
            </Text>
          </Box>
        </Tabs.Panel>
        
        <Tabs.Panel value="animation" pt="md">
          <Box p="md">
            <Text size="sm" c="dimmed" ta="center">
              Select a shape to add animations
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
            Properties
          </Tabs.Tab>
          <Tabs.Tab value="animation" leftSection={<IconPlayerPlay size={14} />}>
            Animation
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="properties" pt="md">
          <Box p="md">
            <Text size="sm" c="dimmed" ta="center">
              Multiple shapes selected
            </Text>
            <Text size="xs" c="dimmed" ta="center" mt="xs">
              Select a single shape to edit properties
            </Text>
          </Box>
        </Tabs.Panel>
        
        <Tabs.Panel value="animation" pt="md">
          <Box p="md">
            <Text size="sm" c="dimmed" ta="center">
              Multiple shapes selected
            </Text>
            <Text size="xs" c="dimmed" ta="center" mt="xs">
              Select a single shape to add animations
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
          Properties
        </Tabs.Tab>
        <Tabs.Tab value="animation" leftSection={<IconPlayerPlay size={14} />}>
          Animation
        </Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panel value="properties" pt="md">
        <Box p="md" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
          <Group justify="space-between" mb="md">
            <Text size="lg" fw={600}>
              Properties
            </Text>
            <Button
              variant="subtle"
              color="red"
              size="sm"
              leftSection={<IconTrash size={14} />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Group>

      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb="xs">
            Type
          </Text>
          <Text size="sm" c="dimmed" tt="capitalize">
            {selectedShape.type}
          </Text>
        </div>

        <Divider />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Position
          </Text>
          <Group grow>
            <NumberInput
              label="X"
              value={selectedShape.x}
              onChange={(value) => handlePropertyChange('x', value || 0)}
              step={1}
            />
            <NumberInput
              label="Y"
              value={selectedShape.y}
              onChange={(value) => handlePropertyChange('y', value || 0)}
              step={1}
            />
          </Group>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Size
          </Text>
          {selectedShape.type === 'circle' && (
            <NumberInput
              label="Radius"
              value={selectedShape.radius || 50}
              onChange={(value) => handlePropertyChange('radius', value || 50)}
              min={1}
              step={1}
            />
          )}
          {(selectedShape.type === 'rectangle') && (
            <Group grow>
              <NumberInput
                label="Width"
                value={selectedShape.width || 100}
                onChange={(value) => handlePropertyChange('width', value || 100)}
                min={1}
                step={1}
              />
              <NumberInput
                label="Height"
                value={selectedShape.height || 60}
                onChange={(value) => handlePropertyChange('height', value || 60)}
                min={1}
                step={1}
              />
            </Group>
          )}
          {selectedShape.type === 'text' && (
            <NumberInput
              label="Font Size"
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
              label="Text"
              value={selectedShape.text || ''}
              onChange={(e) => handlePropertyChange('text', e.target.value)}
            />
            <TextInput
              label="Font Family"
              value={selectedShape.fontFamily || 'Inter'}
              onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
              mt="xs"
            />
          </div>
        )}

        <Divider />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Transform
          </Text>
          <NumberInput
            label="Rotation (degrees)"
            value={selectedShape.rotation}
            onChange={(value) => handlePropertyChange('rotation', value || 0)}
            step={1}
            mb="xs"
          />
          <Group grow>
            <NumberInput
              label="Scale X"
              value={selectedShape.scaleX}
              onChange={(value) => handlePropertyChange('scaleX', value || 1)}
              step={0.1}
              min={0.1}
              precision={2}
            />
            <NumberInput
              label="Scale Y"
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
            Appearance
          </Text>
          <ColorInput
            label="Fill Color"
            value={selectedShape.fill}
            onChange={(value) => handlePropertyChange('fill', value)}
            mb="xs"
          />
          <ColorInput
            label="Stroke Color"
            value={selectedShape.stroke}
            onChange={(value) => handlePropertyChange('stroke', value)}
            mb="xs"
          />
          <NumberInput
            label="Stroke Width"
            value={selectedShape.strokeWidth}
            onChange={(value) => handlePropertyChange('strokeWidth', value || 0)}
            min={0}
            step={1}
            mb="xs"
          />
          <div>
            <Text size="sm" mb="xs">
              Opacity: {Math.round(selectedShape.opacity * 100)}%
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
            label="Visible"
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