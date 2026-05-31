import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import type { ThemeColors, ThemedStyles } from '../styles/global';
import { spacing, fontSize } from '../styles/global';

interface ItemRowProps {
  item: {
    id: number;
    title: string;
    isDone: boolean | null;
    isCheckable?: boolean | null;
  };
  onToggle: (id: number, isDone: boolean | null) => void;
  onToggleCheckable?: (id: number, isCheckable: boolean | null) => void;
  onMoveUp?: (id: number) => void;
  onMoveDown?: (id: number) => void;
  onEdit: (id: number, title: string) => void;
  onDelete: (id: number) => void;
  colors: ThemeColors;
  s: ThemedStyles;
  metaSlot?: ReactNode;
  renderMarkdown?: boolean;
}

const markdownStyles = {
  body: { fontSize: fontSize.base, lineHeight: 22 },
  text: { fontSize: fontSize.base, lineHeight: 22 },
  heading1: { fontSize: 22, lineHeight: 28 },
  heading2: { fontSize: 20, lineHeight: 26 },
  heading3: { fontSize: 18, lineHeight: 24 },
  link: { textDecorationLine: 'underline' as const },
  inlineCode: { fontSize: fontSize.base, lineHeight: 22 },
  blockquote: { fontSize: fontSize.base, lineHeight: 22 },
  code_inline: { fontSize: fontSize.base, lineHeight: 22 },
  fence: { fontSize: fontSize.base, lineHeight: 22 },
  hr: { marginVertical: 4 },
  bullet_list: { marginVertical: 0 },
  ordered_list: { marginVertical: 0 },
  list_item: { marginVertical: 0 },
};

export default function ItemRow({ item, onToggle, onToggleCheckable, onMoveUp, onMoveDown, onEdit, onDelete, colors, s, metaSlot, renderMarkdown }: ItemRowProps) {
  const titleStyle = [
    renderMarkdown ? null : s.itemText,
    { color: colors.primaryText, marginBottom: spacing.xs },
    item.isDone && { color: colors.mutedText, textDecorationLine: 'line-through' as const },
  ];

  return (
    <View style={[s.itemRow, { borderBottomColor: colors.cardBackground }]}>
      <TouchableOpacity
        style={s.checkbox}
        onPress={() => {
          if (item.isCheckable !== false) {
            onToggle(item.id, item.isDone);
          }
        }}
      >
        {item.isCheckable !== false ? (
          <Text style={item.isDone ? [s.checkboxChecked, { color: colors.completedColor }] : [s.checkboxUnchecked, { color: colors.secondaryText }]}>
            {item.isDone ? '✓' : '○'}
          </Text>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={s.itemTitle}
        onPress={() => onEdit(item.id, item.title)}
      >
        {renderMarkdown ? (
          <Markdown style={{
            ...markdownStyles,
            body: { ...markdownStyles.body, ...titleStyle.filter(Boolean).reduce((a, b) => ({ ...a, ...b }), {}) },
            text: { ...markdownStyles.text, ...titleStyle.filter(Boolean).reduce((a, b) => ({ ...a, ...b }), {}) },
          }}>
            {item.title}
          </Markdown>
        ) : (
          <Text style={titleStyle}>
            {item.title}
          </Text>
        )}
        {metaSlot}
      </TouchableOpacity>

      {onMoveUp && onMoveDown && (
        <View style={s.moveButtons}>
          <TouchableOpacity style={s.moveButton} onPress={() => onMoveUp(item.id)}>
            <Text style={[s.moveButtonText, { color: colors.secondaryText }]}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.moveButton} onPress={() => onMoveDown(item.id)}>
            <Text style={[s.moveButtonText, { color: colors.secondaryText }]}>▼</Text>
          </TouchableOpacity>
        </View>
      )}

      {onToggleCheckable && (
        <TouchableOpacity
          style={s.toggleModeButton}
          onPress={() => onToggleCheckable(item.id, item.isCheckable ?? false)}
        >
          <Text style={[s.toggleModeIcon, { color: colors.secondaryText }]}>
            {item.isCheckable !== false ? '☑' : '☐'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={s.deleteItem}
        onPress={() => onDelete(item.id)}
      >
        <Text style={[s.deleteItemText, { color: colors.deleteColor }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}
