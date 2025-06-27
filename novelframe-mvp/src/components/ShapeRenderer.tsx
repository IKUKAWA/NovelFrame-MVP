import React from 'react';
import { Circle, Rect, Text, Line, Transformer } from 'react-konva';
import { Shape, useAppStore } from '../store/appStore';
import { animationEngine } from '../utils/animationEngine';
import Konva from 'konva';

interface ShapeRendererProps {
  shape: Shape;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({ shape, onClick }) => {
  const shapeRef = React.useRef<Konva.Node>(null);
  const transformerRef = React.useRef<Konva.Transformer>(null);
  const { selectedShapeIds, updateShape, currentTime } = useAppStore();
  
  const isSelected = selectedShapeIds.includes(shape.id);

  // Get animated properties
  const animatedProps = React.useMemo(() => {
    const interpolated = animationEngine.getInterpolatedState(shape.id, currentTime);
    return interpolated ? { ...shape, ...interpolated } : shape;
  }, [shape, currentTime]);

  React.useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateShape(shape.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    updateShape(shape.id, {
      x: node.x(),
      y: node.y(),
      scaleX: shape.scaleX * scaleX,
      scaleY: shape.scaleY * scaleY,
      rotation: node.rotation(),
    });
  };

  const renderShape = () => {
    const commonProps = {
      ref: shapeRef,
      x: animatedProps.x,
      y: animatedProps.y,
      scaleX: animatedProps.scaleX,
      scaleY: animatedProps.scaleY,
      rotation: animatedProps.rotation,
      fill: animatedProps.fill,
      stroke: animatedProps.stroke,
      strokeWidth: animatedProps.strokeWidth,
      opacity: animatedProps.opacity,
      visible: animatedProps.visible,
      draggable: true,
      onClick,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
    };

    switch (shape.type) {
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={animatedProps.radius || 50}
          />
        );
      
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            width={animatedProps.width || 100}
            height={animatedProps.height || 60}
          />
        );
      
      case 'text':
        return (
          <Text
            {...commonProps}
            text={animatedProps.text || 'Text'}
            fontSize={animatedProps.fontSize || 24}
            fontFamily={animatedProps.fontFamily || 'Inter'}
          />
        );
      
      case 'polygon':
        if (!shape.vertices || shape.vertices.length === 0) return null;
        
        const points = shape.vertices.flatMap(vertex => [vertex.x, vertex.y]);
        return (
          <Line
            {...commonProps}
            points={points}
            closed
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};