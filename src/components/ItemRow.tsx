import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { ThemeColors, ThemedStyles } from '../styles/global';
import { spacing } from '../styles/global';

interface ItemRowProps {
  item: {
    id: number;
    title: string;
    isDone: boolean | null;
  };
  onToggle: (id: number, isDone: boolean | null) => void;
  onEdit: (id: number, title: string) => void;
  onDelete: (id: number) => void;
  colors: ThemeColors;
  s: ThemedStyles;
  metaSlot?: ReactNode;
}

export default function ItemRow({ item, onToggle, onEdit, onDelete, colors, s, metaSlot }: ItemRowProps) {
  return (
    <View style={[s.itemRow, { borderBottomColor: colors.cardBackground }]}>
      <TouchableOpacity
        style={s.checkbox}
        onPress={() => onToggle(item.id, item.isDone)}
      >
        <Text style={item.isDone ? [s.checkboxChecked, { color: colors.completedColor }] : [s.checkboxUnchecked, { color: colors.secondaryText }]}>
          {item.isDone ? '✓' : '○'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.itemTitle}
        onPress={() => onEdit(item.id, item.title)}
      >
        <Text style={[s.itemText, { color: colors.primaryText, marginBottom: spacing.xs }, item.isDone && { color: colors.mutedText, textDecorationLine: 'line-through' }]}>
          {item.title}
        </Text>
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
