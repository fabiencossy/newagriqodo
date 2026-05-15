import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldPicker } from './FieldPicker';
import type { PickerItem } from './FieldPicker.types';

const items: PickerItem[] = [
  { id: 'p1', label: 'Blé', categoryIds: ['cereal'] },
  { id: 'p2', label: 'Maïs', categoryIds: ['cereal'] },
  { id: 'p3', label: 'Colza', categoryIds: ['oilseed'] },
];

describe('FieldPicker — single', () => {
  it('rend le trigger avec placeholder', () => {
    render(
      <FieldPicker
        title="Cultures"
        mode="single"
        value={[]}
        onChange={vi.fn()}
        items={items}
        placeholder="Choisir une culture…"
      />,
    );
    expect(screen.getByRole('button', { name: /Choisir une culture/ })).toBeInTheDocument();
  });

  it('sélectionne un item au clic', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FieldPicker
        title="Cultures"
        mode="single"
        value={[]}
        onChange={onChange}
        items={items}
        layout="popup"
      />,
    );
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('option', { name: /Blé/ }));
    expect(onChange).toHaveBeenCalledWith(['p1'], expect.any(Array));
  });
});

describe('FieldPicker — multiple', () => {
  it('toggle plusieurs items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <FieldPicker
        title="Cultures"
        mode="multiple"
        value={[]}
        onChange={onChange}
        items={items}
        layout="popup"
      />,
    );
    await user.click(screen.getByRole('button', { expanded: false }));
    await user.click(screen.getByRole('option', { name: /Blé/ }));
    expect(onChange).toHaveBeenLastCalledWith(['p1'], expect.any(Array));

    rerender(
      <FieldPicker
        title="Cultures"
        mode="multiple"
        value={['p1']}
        onChange={onChange}
        items={items}
        layout="popup"
      />,
    );
    await user.click(screen.getByRole('option', { name: /Maïs/ }));
    expect(onChange).toHaveBeenLastCalledWith(['p1', 'p2'], expect.any(Array));
  });
});
