import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { Box } from '@mantine/core';
import { useAppStore } from '../store/appStore';
import { ShapeRenderer } from './ShapeRenderer';
import Konva from 'konva';

export const Canvas: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const {
    currentProject,
    activeTool,
    showGrid,
    gridSize,
    snapToGrid,
    addShape,
    clearSelection,
    selectShape,
  } = useAppStore();

  const [stageSize, setStageSize] = React.useState({ width: 1920, height: 1080 });

  useEffect(() => {
    const updateSize = () => {
      const container = stageRef.current?.container();
      if (container) {
        const containerRect = container.getBoundingClientRect();
        setStageSize({
          width: containerRect.width,
          height: containerRect.height,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const generateGridLines = () => {
    if (!showGrid || !currentProject) return [];

    const lines = [];
    const { width, height } = currentProject;

    // Vertical lines
    for (let i = 0; i <= width; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, height]}
          stroke="#333"
          strokeWidth={0.5}
          opacity={0.5}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= height; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, width, i]}
          stroke="#333"
          strokeWidth={0.5}
          opacity={0.5}
        />
      );
    }

    return lines;
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      if (activeTool === 'select') {
        clearSelection();
      } else {
        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        let x = pos.x;
        let y = pos.y;

        if (snapToGrid) {
          x = Math.round(x / gridSize) * gridSize;
          y = Math.round(y / gridSize) * gridSize;
        }

        let newShape;
        switch (activeTool) {
          case 'circle':
            newShape = {
              type: 'circle' as const,
              x,
              y,
              radius: 50,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
              fill: '#4c6ef5',
              stroke: '#364fc7',
              strokeWidth: 2,
              opacity: 1,
              visible: true,
              zIndex: Date.now(),
            };
            break;
          case 'rectangle':
            newShape = {
              type: 'rectangle' as const,
              x,
              y,
              width: 100,
              height: 60,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
              fill: '#51cf66',
              stroke: '#37b24d',
              strokeWidth: 2,
              opacity: 1,
              visible: true,
              zIndex: Date.now(),
            };
            break;
          case 'text':
            newShape = {
              type: 'text' as const,
              x,
              y,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
              fill: '#ffffff',
              stroke: '',
              strokeWidth: 0,
              opacity: 1,
              visible: true,
              zIndex: Date.now(),
              text: 'Sample Text',
              fontSize: 24,
              fontFamily: 'Inter',
            };
            break;
          default:
            return;
        }

        if (newShape) {
          addShape(newShape);
        }
      }
    }
  };

  const handleShapeClick = (shapeId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    selectShape(shapeId, e.evt.ctrlKey || e.evt.metaKey);
  };

  if (!currentProject) {
    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '18px',
        }}
      >
        Create or open a project to start
      </Box>
    );
  }

  return (
    <Box style={{ width: '100%', height: '100%', backgroundColor: '#1a1a1a' }}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
        scaleX={Math.min(stageSize.width / currentProject.width, stageSize.height / currentProject.height) * 0.8}
        scaleY={Math.min(stageSize.width / currentProject.width, stageSize.height / currentProject.height) * 0.8}
        x={(stageSize.width - currentProject.width * Math.min(stageSize.width / currentProject.width, stageSize.height / currentProject.height) * 0.8) / 2}
        y={(stageSize.height - currentProject.height * Math.min(stageSize.width / currentProject.width, stageSize.height / currentProject.height) * 0.8) / 2}
      >
        <Layer>
          {/* Project background */}
          <Rect
            x={0}
            y={0}
            width={currentProject.width}
            height={currentProject.height}
            fill={currentProject.backgroundColor}
            stroke="#444"
            strokeWidth={2}
          />
          
          {/* Grid */}
          {generateGridLines()}
          
          {/* Shapes */}
          {currentProject.shapes
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((shape) => (
              <ShapeRenderer
                key={shape.id}
                shape={shape}
                onClick={(e) => handleShapeClick(shape.id, e)}
              />
            ))}
        </Layer>
      </Stage>
    </Box>
  );
};