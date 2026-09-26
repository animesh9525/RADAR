import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout';
import { ToastHost, AIProcessOverlay2 } from './components/ui';
import { TaskModal } from './components/TaskModal';
import { BlockModal } from './components/BlockModal';
import { LoginScreen } from './pages/LoginScreen';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { BlockPlannerPage } from './pages/BlockPlannerPage';
import { KanbanPage } from './pages/KanbanPage';
import { WeeklyPage } from './pages/WeeklyPage';
import { MonthlyPage } from './pages/MonthlyPage';
import { AIPlanningPage } from './pages/AIPlanningPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { NetworkOpsPage } from './pages/NetworkOpsPage';
import { ConflictsPage } from './pages/ConflictsPage';
import { CorridorPage } from './pages/CorridorPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { AssetsPage } from './pages/AssetsPage';
import { GanttPage } from './pages/GanttPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { AssistantPage } from './pages/AssistantPage';
import { DataIntegPage } from './pages/DataIntegPage';
import { SettingsPage } from './pages/SettingsPage';

function Shell() {
  const { user, toasts, aiRunState, dismissToast, taskModal, closeTaskModal, blockModal, closeBlockModal, trains, taskData, deleteBlock } = useApp();
  return (
    <>
      {!user ? (
        <LoginScreen />
      ) : (
        <Routes>
          <Route element={<AppLayout />}>
            {/* 13 Primary Screens (in sidebar) */}
            <Route index element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/block-planner" element={<BlockPlannerPage />} />
            <Route path="/schedule" element={<WeeklyPage />} />
            <Route path="/monthly" element={<MonthlyPage />} />
            <Route path="/network" element={<NetworkOpsPage />} />
            <Route path="/conflicts" element={<ConflictsPage />} />
            <Route path="/what-if" element={<WhatIfPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/approval" element={<ApprovalPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Sub-screens (linked internally from primary pages) */}
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/ai-planning" element={<AIPlanningPage />} />
            <Route path="/corridor" element={<CorridorPage />} />
            <Route path="/gantt" element={<GanttPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/data" element={<DataIntegPage />} />

            {/* URL aliases (redirect to canonical screen so the shared shell + Demo Planner identity stays present) */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/weekly" element={<Navigate to="/schedule" replace />} />
            <Route path="/map" element={<Navigate to="/network" replace />} />
            <Route path="/network-operations" element={<Navigate to="/network" replace />} />
            <Route path="/data-integration" element={<Navigate to="/data" replace />} />
          </Route>
        </Routes>
      )}
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AIProcessOverlay2 runState={aiRunState} />

      {taskModal.open && (
        <TaskModal
          task={taskModal.task}
          onClose={closeTaskModal}
          onAssignToBlock={() => closeTaskModal()}
        />
      )}

      {blockModal.open && (
        <BlockModal
          block={blockModal.block}
          trains={trains}
          taskData={taskData}
          onClose={closeBlockModal}
          onDelete={deleteBlock}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  );
}