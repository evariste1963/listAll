import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import Markdown from 'react-native-markdown-display';
import type { ThemeColors, ThemedStyles } from '../styles/global';
import { spacing, fontSize } from '../styles/global';

interface ItemRowProps {
  item: {
    id: number;
    title: string;
    isDone: boolean | null;
    isCheckable?: boolean | null;
    itemType?: string | null;
    url?: string | null;
    imagePath?: string | null;
    description?: string | null;
  };
  onToggle: (id: number, isDone: boolean | null) => void;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  onEdit: (id: number, title: string) => void;
  onDelete: (id: number) => void;
  onViewImage?: (imagePath: string, description?: string | null) => void;
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

export default function ItemRow({ item, onToggle, isSelected, onSelect, onEdit, onDelete, onViewImage, colors, s, metaSlot, renderMarkdown }: ItemRowProps) {
  const titleStyle = [
    renderMarkdown ? null : s.itemText,
    { color: colors.primaryText, marginBottom: spacing.xs },
    item.isDone && { color: colors.mutedText, textDecorationLine: 'line-through' as const },
  ];

  const type = item.itemType || 'note';

  const renderSelectCircle = () => (
    <TouchableOpacity
      style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}
      onPress={() => onSelect?.(item.id)}
    >
      <Text style={{ fontSize: 20, color: isSelected ? colors.accentColor : colors.mutedText }}>
        {isSelected ? '●' : '○'}
      </Text>
    </TouchableOpacity>
  );

  const renderCheckbox = () => (
    <TouchableOpacity
      style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}
      onPress={() => {
        if (item.isCheckable !== false) {
          onToggle(item.id, item.isDone);
        }
      }}
    >
      {item.isCheckable !== false ? (
        <Text style={[{ fontSize: 20 }, item.isDone ? { color: colors.completedColor } : { color: colors.secondaryText }]}>
          {item.isDone ? '✓' : '○'}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  const renderControlColumn = () => (
    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm }}>
      {onSelect && renderSelectCircle()}
      {renderCheckbox()}
    </View>
  );

  if (type === 'link') {
    return (
      <View style={[s.itemRow, { borderBottomColor: colors.cardBackground }]}>
        {renderControlColumn()}
        <TouchableOpacity
          style={[s.itemTitle, { flexDirection: 'row', alignItems: 'flex-start' }]}
          onPress={() => item.url ? Linking.openURL(item.url) : null}
        >
          {item.imagePath && (
            <Image
              source={{ uri: item.imagePath }}
              style={{ width: 60, height: 60, borderRadius: 6, marginRight: spacing.md }}
              resizeMode="cover"
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[{ color: colors.primaryText, fontSize: fontSize.base, fontWeight: '600', marginBottom: 2 }, item.isDone && { color: colors.mutedText, textDecorationLine: 'line-through' }]}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={{ color: colors.secondaryText, fontSize: fontSize.sm, marginBottom: 2 }} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            {item.url ? (
              <Text style={{ color: colors.mutedText, fontSize: fontSize.xs }} numberOfLines={1}>
                {item.url}
              </Text>
            ) : null}
          </View>
          {metaSlot}
        </TouchableOpacity>
        <TouchableOpacity
          style={s.deleteItem}
          onPress={() => onDelete(item.id)}
        >
          <Text style={[s.deleteItemText, { color: colors.deleteColor }]}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (type === 'image') {
    return (
      <View style={[s.itemRow, { borderBottomColor: colors.cardBackground, flexDirection: 'column', alignItems: 'stretch' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {renderControlColumn()}
          <TouchableOpacity
            style={s.itemTitle}
            onPress={() => onViewImage?.(item.imagePath ?? '', item.description)}
          >
            {item.imagePath ? (
              <Image
                source={{ uri: item.imagePath }}
                style={{ width: '100%', height: 120, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : null}
            {item.description ? (
              <Text style={[s.itemText, { color: colors.primaryText, marginTop: spacing.xs }, item.isDone && { color: colors.mutedText, textDecorationLine: 'line-through' }]}>
                {item.description}
              </Text>
            ) : null}
            {metaSlot}
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: spacing.xs }}>
          <TouchableOpacity
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}
            onPress={() => onEdit(item.id, item.title)}
          >
            <Text style={{ fontSize: 14, color: colors.secondaryText }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.deleteItem}
            onPress={() => onDelete(item.id)}
          >
            <Text style={[s.deleteItemText, { color: colors.deleteColor }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.itemRow, { borderBottomColor: colors.cardBackground }]}>
      {renderControlColumn()}
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

      <TouchableOpacity
        style={s.deleteItem}
        onPress={() => onDelete(item.id)}
      >
        <Text style={[s.deleteItemText, { color: colors.deleteColor }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}
