import React, { useState } from 'react';
import {
  Group,
  Button,
  ActionIcon,
  Divider,
  Menu,
  Text,
  Tooltip,
  Modal,
} from '@mantine/core';
import {
  IconSelector,
  IconCircle,
  IconSquare,
  IconPolygon,
  IconType,
  IconFile,
  IconFolder,
  IconDeviceFloppy,
  IconPlay,
  IconPause,
  IconStop,
  IconGrid3x3,
  IconMagnet,
  IconDownload,
} from '@tabler/icons-react';
import { useAppStore } from '../store/appStore';
import { ExportPanel } from './ExportPanel';

export const Toolbar: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const {
    activeTool,
    setActiveTool,
    currentProject,
    createProject,
    saveProject,
    isPlaying,
    play,
    pause,
    stop,
    showGrid,
    toggleGrid,
    snapToGrid,
    toggleSnapToGrid,
  } = useAppStore();

  const tools = [
    { id: 'select' as const, icon: IconSelector, label: '選択' },
    { id: 'circle' as const, icon: IconCircle, label: '円' },
    { id: 'rectangle' as const, icon: IconSquare, label: '四角形' },
    { id: 'polygon' as const, icon: IconPolygon, label: '多角形' },
    { id: 'text' as const, icon: IconType, label: 'テキスト' },
  ];

  const handleNewProject = () => {
    const projectName = prompt('プロジェクト名を入力してください:');
    if (projectName) {
      createProject(projectName);
    }
  };

  const handleLoadProject = async () => {
    try {
      const result = await window.electronAPI.openFile();
      if (!result.canceled && result.filePaths[0]) {
        const fileResult = await window.electronAPI.readFile(result.filePaths[0]);
        if (fileResult.success && fileResult.data) {
          const project = JSON.parse(fileResult.data);
          useAppStore.getState().loadProject(project);
        }
      }
    } catch (error) {
      console.error('プロジェクトの読み込みに失敗しました:', error);
    }
  };

  return (
    <Group justify="space-between" px="md" py="sm" style={{ height: '100%' }}>
      <Group gap="xs">
        {/* File operations */}
        <Menu>
          <Menu.Target>
            <Button variant="subtle" leftSection={<IconFile size={16} />}>
              ファイル
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconFile size={16} />} onClick={handleNewProject}>
              新規プロジェクト
            </Menu.Item>
            <Menu.Item leftSection={<IconFolder size={16} />} onClick={handleLoadProject}>
              プロジェクトを開く
            </Menu.Item>
            <Menu.Item
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={saveProject}
              disabled={!currentProject}
            >
              プロジェクトを保存
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Divider orientation="vertical" />

        {/* Tools */}
        <Group gap="xs">
          {tools.map((tool) => (
            <Tooltip key={tool.id} label={tool.label}>
              <ActionIcon
                variant={activeTool === tool.id ? 'filled' : 'subtle'}
                onClick={() => setActiveTool(tool.id)}
                size="lg"
              >
                <tool.icon size={18} />
              </ActionIcon>
            </Tooltip>
          ))}
        </Group>

        <Divider orientation="vertical" />

        {/* Grid controls */}
        <Group gap="xs">
          <Tooltip label="グリッド表示">
            <ActionIcon
              variant={showGrid ? 'filled' : 'subtle'}
              onClick={toggleGrid}
            >
              <IconGrid3x3 size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="グリッドに吸着">
            <ActionIcon
              variant={snapToGrid ? 'filled' : 'subtle'}
              onClick={toggleSnapToGrid}
            >
              <IconMagnet size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Group gap="xs">
        {/* Project name */}
        {currentProject && (
          <Text size="sm" c="dimmed">
            {currentProject.name}
          </Text>
        )}

        <Divider orientation="vertical" />

        {/* Playback controls */}
        <Group gap="xs">
          <Tooltip label="再生">
            <ActionIcon
              variant={isPlaying ? 'filled' : 'subtle'}
              onClick={isPlaying ? pause : play}
              disabled={!currentProject}
            >
              {isPlaying ? <IconPause size={16} /> : <IconPlay size={16} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="停止">
            <ActionIcon
              variant="subtle"
              onClick={stop}
              disabled={!currentProject}
            >
              <IconStop size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Export */}
        <Tooltip label="エクスポート">
          <ActionIcon
            variant="subtle"
            onClick={() => setShowExportModal(true)}
            disabled={!currentProject}
          >
            <IconDownload size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Modal
        opened={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Video"
        size="lg"
      >
        <ExportPanel />
      </Modal>
    </Group>
  );
};