import React from 'react';
import { AppShell, Box } from '@mantine/core';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { Timeline } from './components/Timeline';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ChatPanel } from './components/ChatPanel';
import { useAppStore } from './store/appStore';

export const App: React.FC = () => {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'md' }}
      aside={{ width: 320, breakpoint: 'md' }}
      footer={{ height: 200 }}
      padding={0}
      styles={{
        main: {
          backgroundColor: '#0a0a0a',
          height: '100vh',
        },
        header: {
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #333',
        },
        navbar: {
          backgroundColor: '#151515',
          borderRight: '1px solid #333',
        },
        aside: {
          backgroundColor: '#151515',
          borderLeft: '1px solid #333',
        },
        footer: {
          backgroundColor: '#1a1a1a',
          borderTop: '1px solid #333',
        },
      }}
    >
      <AppShell.Header>
        <Toolbar />
      </AppShell.Header>

      <AppShell.Navbar>
        <ChatPanel />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box style={{ height: 'calc(100vh - 260px)', position: 'relative' }}>
          <Canvas />
        </Box>
      </AppShell.Main>

      <AppShell.Aside>
        <PropertiesPanel />
      </AppShell.Aside>

      <AppShell.Footer>
        <Timeline />
      </AppShell.Footer>
    </AppShell>
  );
};