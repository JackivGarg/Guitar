import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    // Interactive web pages use native media. Timeline rules still apply to compositions.
    files: [
      "src/{ChangeAtlas,LearningHome,LegacyLibrary,LessonSeven,PracticeDesk,ReferenceRoom,SourceVideo,Tools}.tsx",
      "src/journey/**/*.tsx",
      "src/changes/**/*.tsx",
      "src/world/GuitarWorld.tsx",
    ],
    rules: {
      "@remotion/warn-native-media-tag": "off",
      "@remotion/no-string-assets": "off",
    },
  },
];
