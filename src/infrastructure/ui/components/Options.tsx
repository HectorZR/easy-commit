import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';
import { colors, text } from '../styles';

export type OptionType = {
  label: string;
  onSelect?: () => void;
  color?: (label: string) => string;
};

interface OptionsProps {
  title: string;
  options: OptionType[];
  titleColor?: (label: string) => string;
}

export function Options({ title, options, titleColor }: OptionsProps) {
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setSelected((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow || input === 'j') {
      setSelected((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      const selectedOption = options[selected];
      selectedOption?.onSelect?.();
    }
  });

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text>{titleColor ? titleColor(title) : text.label(title)}</Text>
      {options.map((option, index) => {
        const isSelected = index === selected;
        return <Option {...option} selected={isSelected} key={option.label} />;
      })}
    </Box>
  );
}

interface OptionProps extends OptionType {
  selected: boolean;
}

function Option({ label, selected, color }: OptionProps) {
  const colorizedLabel = color ? color(label) : label;
  const colorizedHighlight = color ? color('❯ ') : colors.primary('❯ ');
  return (
    <Box>
      <Text>{selected ? colorizedHighlight : '  '}</Text>
      <Text>{selected ? colorizedLabel : label}</Text>
    </Box>
  );
}
