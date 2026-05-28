# PassDrop Project Guidelines

This document outlines the architecture, patterns, and best practices used in the PassDrop codebase.

## 🏗️ Core Technologies
- **Framework**: [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [Ionic Vue](https://ionicframework.com/docs/vue/overview)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Native Bridge**: [Capacitor](https://capacitorjs.com/)
- **Storage**: `@capacitor/preferences`

## 📂 Project Structure
- `src/assets`: Static assets (images, icons).
- `src/components`: Reusable UI components.
    - Group related components in subdirectories (e.g., `CodeViewer/`, `PassList/`).
- `src/composables`: Shared stateful logic (e.g., `useSwipeToPage`).
- `src/router`: Routing configuration using `vue-router`.
- `src/stores`: Pinia stores for global state management.
- `src/utils`: Helper functions and utilities (e.g., `color.ts`).
- `src/views`: Top-level page components managed by the router.

## 🛠️ Code Patterns & Best Practices

### 1. Vue Components
- **Style**: Use `<script setup lang="ts">` for all components.
- **Imports**: Use the `@` alias for paths (e.g., `import X from '@/components/X.vue'`).
- **Props**: Define props using `defineProps<{ ... }>()` for type safety.
- **Events**: Use `defineEmits` for custom events.
- **Styling**: Always use `<style scoped>` to prevent global style leakage.

### 2. Ionic Usage
- Use standard Ionic components (`IonPage`, `IonHeader`, `IonToolbar`, `IonContent`, etc.).
- Prefer Ionic-specific lifecycle hooks (e.g., `onIonViewDidEnter`) where appropriate.
- Follow Ionic's layout structure for pages to ensure consistent behavior across platforms.

### 3. State Management
- Define stores in `src/stores` using `defineStore`.
- Follow the "setup" style for Pinia stores (using `ref` and `computed`).
- Persist state using `@capacitor/preferences` when necessary (e.g., for user data like passes).

### 4. Logic Extraction
- Move complex or reusable logic into **Composables** (`src/composables`).
- Use **Utils** for pure, stateless functions.

### 5. Naming Conventions
- **Components**: PascalCase (e.g., `PassEditor.vue`).
- **Views**: PascalCase with `Page` suffix (e.g., `PassesPage.vue`).
- **Stores**: camelCase with `Store` suffix (e.g., `passesStore`).
- **Composables**: camelCase with `use` prefix (e.g., `usePassesStore`).
- **Variables**: camelCase (e.g., `passId`) and avoid single-letter names unless widespread (e.g., `i` in loops).

## 📱 Platform Considerations
- **Capacitor**: Use `@capacitor/*` plugins for native functionality.
- **Mobile First**: Design for touch interactions (e.g., custom swipe gestures via `createGesture`).
- **Color Contrast**: Use utility functions (like `textColorForBackground`) to ensure readability on dynamic backgrounds.

## 🚀 Development Workflow
- **Vite**: The project is served and built using Vite.
- **Ionic CLI**: Use `ionic serve` for development and `ionic build` for production builds.
- **Capacitor CLI**: Use `npx cap sync` to synchronize changes with native platforms.
