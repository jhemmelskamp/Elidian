import type { ReactElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, type HistoryItem } from '../types';
import EditorPage from './EditorPage';
import HistoryPage from './HistoryPage';
import SettingsPage from './SettingsPage';

vi.mock('../lib/renderPostImage', () => ({
  renderPostToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,AAAA'),
  renderPostToBlob: vi.fn().mockResolvedValue(new Blob(['x'], { type: 'image/png' })),
}));

vi.mock('../lib/logo', () => ({
  loadLogoImage: vi.fn().mockResolvedValue({ naturalWidth: 100, naturalHeight: 50 }),
}));

function renderWithRoute(path: string, element: ReactElement): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('pages', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('editor keeps generate disabled for empty text', () => {
    renderWithRoute('/', <EditorPage />);
    expect(screen.getByRole('button', { name: 'Bild generieren' })).toBeDisabled();
  });

  it('editor shows category choices and defaults to Aussage', () => {
    renderWithRoute('/', <EditorPage />);
    expect(screen.getByRole('radio', { name: 'Aussage' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Film' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Zitat' })).toBeInTheDocument();
  });

  it('history shows newest items first', () => {
    const entries: HistoryItem[] = [
      { id: '1', text: 'Älter', createdAt: '2026-02-20T10:00:00.000Z', settingsSnapshot: DEFAULT_SETTINGS },
      { id: '2', text: 'Neuer', createdAt: '2026-02-21T10:00:00.000Z', settingsSnapshot: DEFAULT_SETTINGS },
    ];
    localStorage.setItem('elidian.history.v1', JSON.stringify(entries));
    renderWithRoute('/history', <HistoryPage />);
    const texts = screen.getAllByText(/Älter|Neuer/);
    expect(texts[0]).toHaveTextContent('Neuer');
  });

  it('settings blocks invalid values on save', async () => {
    const user = userEvent.setup();
    renderWithRoute('/settings', <SettingsPage />);
    const widthInput = screen.getByLabelText('Breite');
    await user.clear(widthInput);
    await user.type(widthInput, '50');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(screen.getByText(/Breite muss zwischen/)).toBeInTheDocument();
  });

  it('settings reset restores #FFE0B5 as text color', async () => {
    const user = userEvent.setup();
    renderWithRoute('/settings', <SettingsPage />);
    const textColorInput = screen.getByLabelText('Textfarbe');
    fireEvent.change(textColorInput, { target: { value: '#000000' } });
    await user.click(screen.getByRole('button', { name: /Auf Standard/i }));
    expect(screen.getByLabelText('Textfarbe')).toHaveValue('#ffe0b5');
  });
});
