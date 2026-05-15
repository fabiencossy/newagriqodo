import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewSwitcher } from './ViewSwitcher';
import type { ViewKey } from './ViewSwitcher.types';

describe('ViewSwitcher (segmented)', () => {
  const baseViews: ViewKey[] = ['table', 'map', 'dashboard'];

  function renderSegmented(activeView: ViewKey = 'table', onChange = vi.fn()) {
    return {
      onChange,
      ...render(
        <ViewSwitcher
          views={baseViews}
          activeView={activeView}
          onChange={onChange}
          layout="segmented"
        />,
      ),
    };
  }

  it('rend un tab par vue', () => {
    renderSegmented();
    const tablist = screen.getByRole('tablist', { name: 'Changer de vue' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAccessibleName(/table/i);
    expect(tabs[1]).toHaveAccessibleName(/carte/i);
    expect(tabs[2]).toHaveAccessibleName(/dashboard/i);
  });

  it('marque la vue active avec aria-pressed', () => {
    renderSegmented('map');
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'false');
    expect(tabs[1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('appelle onChange lors du clic sur une vue différente', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSegmented('table');
    await user.click(screen.getByRole('tab', { name: /carte/i }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('map');
  });

  it('ignore le clic sur la vue déjà active', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSegmented('table');
    await user.click(screen.getByRole('tab', { name: /table/i }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabledViews désactive une vue individuelle', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ViewSwitcher
        views={baseViews}
        activeView="table"
        onChange={onChange}
        disabledViews={['map']}
        layout="segmented"
      />,
    );
    const mapTab = screen.getByRole('tab', { name: /carte/i });
    expect(mapTab).toBeDisabled();
    await user.click(mapTab);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('prop disabled bloque toutes les vues', () => {
    render(
      <ViewSwitcher
        views={baseViews}
        activeView="table"
        onChange={vi.fn()}
        disabled
        layout="segmented"
      />,
    );
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab).toBeDisabled();
    }
  });

  it('display="icon-only" expose le label via aria-label', () => {
    render(
      <ViewSwitcher
        views={baseViews}
        activeView="table"
        onChange={vi.fn()}
        layout="segmented"
        display="icon-only"
      />,
    );
    const mapTab = screen.getByRole('tab', { name: /carte/i });
    expect(mapTab).toHaveAttribute('aria-label', 'Carte');
  });
});

describe('ViewSwitcher (dropdown)', () => {
  const views: ViewKey[] = ['table', 'map', 'dashboard'];

  it("ouvre la liste d'options au clic sur le trigger", async () => {
    const user = userEvent.setup();
    render(<ViewSwitcher views={views} activeView="table" onChange={vi.fn()} layout="dropdown" />);
    const trigger = screen.getByRole('button', { name: 'Changer de vue' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Changer de vue' })).toBeInTheDocument();
  });

  it('sélectionne une vue et ferme la liste', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewSwitcher views={views} activeView="table" onChange={onChange} layout="dropdown" />);
    await user.click(screen.getByRole('button', { name: 'Changer de vue' }));
    await user.click(screen.getByRole('option', { name: /carte/i }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('map');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
