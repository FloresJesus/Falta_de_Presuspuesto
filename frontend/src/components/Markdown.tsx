import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { MarkdownBlock, parseInline, renderMarkdown } from '@/lib/utils';

export function Markdown({ text, style }: { text: string; style?: any }) {
  const blocks = renderMarkdown(text);
  return (
    <View style={[{ flexGrow: 1 }, style]}>
      {blocks.map((b: MarkdownBlock, i: number) => {
        if (b.type === 'heading') {
          const parts = Array.isArray(b.text) ? b.text : parseInline(b.text);
          return (
            <Text key={i} style={styles.heading}>
              {parts.map((p, j) => (
                <Text key={j} style={p.bold ? styles.headingBold : undefined}>{p.text}</Text>
              ))}
            </Text>
          );
        }
        if (b.type === 'list') {
          return (
            <View key={i} style={styles.list}>
              {b.items.map((item, j) => (
                <Text key={j} style={styles.listItem}>
                  {'•  '}
                  {item}
                </Text>
              ))}
            </View>
          );
        }
        const parts = Array.isArray(b.text) ? b.text : parseInline(b.text);
        return (
          <Text key={i} style={styles.paragraph}>
            {parts.map((p, j) => (
              <Text key={j} style={p.bold ? styles.paragraphBold : undefined}>
                {p.text}
              </Text>
            ))}
            {i < blocks.length - 1 ? '\n' : ''}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  paragraph: { fontSize: 15, lineHeight: 24, color: '#4E1D71', marginBottom: 10, fontWeight: '500' },
  paragraphBold: { fontWeight: '800' },
  heading: { fontSize: 19, fontWeight: '800', lineHeight: 26, marginTop: 14, marginBottom: 8 },
  headingBold: { fontWeight: '800' },
  list: { marginBottom: 10 },
  listItem: { fontSize: 15, lineHeight: 22, color: '#4E1D71', marginBottom: 3, fontWeight: '600' },
});
