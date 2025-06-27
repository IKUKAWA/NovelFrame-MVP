import React, { useState } from 'react';
import {
  Box,
  Text,
  Stack,
  Group,
  Button,
  NumberInput,
  Select,
  Progress,
  Modal,
  Alert,
} from '@mantine/core';
import {
  IconDownload,
  IconVideo,
  IconPhoto,
  IconSettings,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useAppStore } from '../store/appStore';
import { createVideoExporter, ExportSettings } from '../utils/videoExporter';

export const ExportPanel: React.FC = () => {
  const { currentProject } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 5000,
    quality: 'medium',
    format: 'mp4',
  });

  if (!currentProject) {
    return (
      <Box p="md">
        <Text size="lg" fw={600} mb="md">
          Export
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Create a project to export
        </Text>
      </Box>
    );
  }

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setShowExportModal(true);

    try {
      const exporter = createVideoExporter(currentProject);
      
      if (exportSettings.format === 'png') {
        // Export individual frames
        const frames = await exporter.exportFrames(exportSettings, setExportProgress);
        
        // Download frames as ZIP or individual files
        for (let i = 0; i < frames.length; i++) {
          const url = URL.createObjectURL(frames[i]);
          const a = document.createElement('a');
          a.href = url;
          a.download = `frame_${i.toString().padStart(4, '0')}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // Export as video
        const videoBlob = await exporter.exportVideo(exportSettings, setExportProgress);
        
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject.name}.${exportSettings.format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      exporter.dispose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setTimeout(() => {
        setShowExportModal(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  const qualityOptions = [
    { value: 'low', label: 'Low (Fast)' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High (Slow)' },
  ];

  const formatOptions = [
    { value: 'mp4', label: 'MP4 Video' },
    { value: 'webm', label: 'WebM Video' },
    { value: 'gif', label: 'Animated GIF' },
    { value: 'png', label: 'PNG Sequence' },
  ];

  const presets = [
    { name: 'HD 1080p', width: 1920, height: 1080 },
    { name: 'HD 720p', width: 1280, height: 720 },
    { name: 'Instagram Square', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'TikTok', width: 1080, height: 1920 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  ];

  const estimatedFileSize = () => {
    const frameCount = Math.ceil((exportSettings.duration / 1000) * exportSettings.fps);
    const pixelCount = exportSettings.width * exportSettings.height;
    const bytesPerPixel = exportSettings.quality === 'high' ? 4 : exportSettings.quality === 'medium' ? 2 : 1;
    const totalBytes = frameCount * pixelCount * bytesPerPixel;
    
    if (totalBytes > 1024 * 1024 * 1024) {
      return `~${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (totalBytes > 1024 * 1024) {
      return `~${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `~${(totalBytes / 1024).toFixed(1)} KB`;
    }
  };

  return (
    <>
      <Box p="md" style={{ height: '100%', overflowY: 'auto' }}>
        <Text size="lg" fw={600} mb="md">
          Export
        </Text>

        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Quick Presets
            </Text>
            <Stack gap="xs">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="light"
                  size="sm"
                  onClick={() => setExportSettings(prev => ({
                    ...prev,
                    width: preset.width,
                    height: preset.height,
                  }))}
                  leftSection={<IconSettings size={14} />}
                >
                  {preset.name} ({preset.width}×{preset.height})
                </Button>
              ))}
            </Stack>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Export Settings
            </Text>
            <Stack gap="sm">
              <Group grow>
                <NumberInput
                  label="Width"
                  value={exportSettings.width}
                  onChange={(value) => setExportSettings(prev => ({ ...prev, width: value || 1920 }))}
                  min={100}
                  max={4000}
                  step={10}
                />
                <NumberInput
                  label="Height"
                  value={exportSettings.height}
                  onChange={(value) => setExportSettings(prev => ({ ...prev, height: value || 1080 }))}
                  min={100}
                  max={4000}
                  step={10}
                />
              </Group>

              <Group grow>
                <NumberInput
                  label="FPS"
                  value={exportSettings.fps}
                  onChange={(value) => setExportSettings(prev => ({ ...prev, fps: value || 30 }))}
                  min={12}
                  max={60}
                  step={1}
                />
                <NumberInput
                  label="Duration (ms)"
                  value={exportSettings.duration}
                  onChange={(value) => setExportSettings(prev => ({ ...prev, duration: value || currentProject.duration }))}
                  min={100}
                  max={60000}
                  step={100}
                />
              </Group>

              <Select
                label="Format"
                value={exportSettings.format}
                onChange={(value) => setExportSettings(prev => ({ ...prev, format: value as any || 'mp4' }))}
                data={formatOptions}
              />

              <Select
                label="Quality"
                value={exportSettings.quality}
                onChange={(value) => setExportSettings(prev => ({ ...prev, quality: value as any || 'medium' }))}
                data={qualityOptions}
              />
            </Stack>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Preview
            </Text>
            <Text size="xs" c="dimmed">
              Resolution: {exportSettings.width} × {exportSettings.height}<br />
              Frame Rate: {exportSettings.fps} FPS<br />
              Duration: {(exportSettings.duration / 1000).toFixed(1)} seconds<br />
              Total Frames: {Math.ceil((exportSettings.duration / 1000) * exportSettings.fps)}<br />
              Estimated Size: {estimatedFileSize()}
            </Text>
          </div>

          {exportSettings.format === 'mp4' && (
            <Alert icon={<IconAlertCircle size={16} />} color="orange">
              MP4 export is experimental. For best results, use PNG sequence and convert externally.
            </Alert>
          )}

          <Button
            onClick={handleExport}
            disabled={isExporting}
            size="lg"
            leftSection={exportSettings.format === 'png' ? <IconPhoto size={18} /> : <IconVideo size={18} />}
          >
            {isExporting ? 'Exporting...' : `Export ${exportSettings.format.toUpperCase()}`}
          </Button>
        </Stack>
      </Box>

      <Modal
        opened={showExportModal}
        onClose={() => !isExporting && setShowExportModal(false)}
        title="Exporting..."
        withCloseButton={!isExporting}
        closeOnClickOutside={!isExporting}
        closeOnEscape={!isExporting}
      >
        <Stack gap="md">
          <Text size="sm">
            {isExporting ? 'Rendering frames...' : 'Export completed!'}
          </Text>
          <Progress 
            value={exportProgress * 100} 
            size="lg"
            animated={isExporting}
          />
          <Text size="xs" c="dimmed" ta="center">
            {Math.round(exportProgress * 100)}% complete
          </Text>
        </Stack>
      </Modal>
    </>
  );
};