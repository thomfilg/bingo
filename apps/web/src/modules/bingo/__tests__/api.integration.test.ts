/**
 * Integration tests for Bingo API routes
 * Tests the API endpoints with mocked services
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { setBingoModule, resetBingoModule } from '@/shared/api/module-factory';
import type { BingoModule } from '../bingo.module';
import type { CardsRepository } from '../repositories/cards.repository';
import type { CellsRepository } from '../repositories/cells.repository';
import type { SessionsRepository } from '../repositories/sessions.repository';
import { CardsService } from '../services/cards.service';
import { CellsService } from '../services/cells.service';
import { SessionsService } from '../services/sessions.service';
import type {
  BingoCard,
  BingoCell,
  BingoSession,
  BingoSessionPlayer,
  CellType,
  CardSource,
  SessionStatus,
} from '../types';

// Mock data factories
const createMockCell = (overrides: Partial<BingoCell> = {}): BingoCell => ({
  id: 'cell-123',
  cardId: 'card-123',
  index: 0,
  value: 5,
  type: 'NUMBER' as CellType,
  marked: false,
  ...overrides,
});

const createMockCard = (overrides: Partial<BingoCard> = {}): BingoCard => ({
  id: 'card-123',
  userId: 'user-123',
  sessionPlayerId: 'session-player-123',
  source: 'GENERATED' as CardSource,
  format: '5x5',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockSession = (overrides: Partial<BingoSession> = {}): BingoSession => ({
  id: 'session-123',
  name: 'Test Session',
  format: '5x5',
  status: 'ACTIVE' as SessionStatus,
  calledNumbers: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockSessionPlayer = (overrides: Partial<BingoSessionPlayer> = {}): BingoSessionPlayer => ({
  id: 'session-player-123',
  userId: 'user-123',
  sessionId: 'session-123',
  joinedAt: new Date('2024-01-01'),
  ...overrides,
});

// Mock repository factories
const createMockCardsRepository = (): CardsRepository => ({
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findBySessionPlayerId: vi.fn(),
  findStandaloneByUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

const createMockCellsRepository = (): CellsRepository => ({
  findByCardId: vi.fn(),
  findByCardIdAndIndex: vi.fn(),
  updateMarkedStatus: vi.fn(),
  bulkUpdateMarkedStatus: vi.fn(),
  createMany: vi.fn(),
});

const createMockSessionsRepository = (): SessionsRepository => ({
  findById: vi.fn(),
  findPlayerByUserAndSession: vi.fn(),
  getSessionFormat: vi.fn(),
});

// Helper to create a request with auth headers
function createAuthenticatedRequest(
  url: string,
  options: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
  } = {},
  userId = 'user-123',
  userEmail = 'test@example.com',
  userTier = 'FREE'
): NextRequest {
  const headers: Record<string, string> = {
    'x-user-id': userId,
    'x-user-email': userEmail,
    'x-user-tier': userTier,
    ...options.headers,
  };

  if (options.body) {
    headers['content-type'] = 'application/json';
  }

  return new NextRequest(url, {
    method: options.method || 'GET',
    headers,
    body: options.body,
  });
}

describe('API Integration Tests', () => {
  let mockCardsRepository: CardsRepository;
  let mockCellsRepository: CellsRepository;
  let mockSessionsRepository: SessionsRepository;
  let mockBingoModule: BingoModule;

  beforeEach(() => {
    mockCardsRepository = createMockCardsRepository();
    mockCellsRepository = createMockCellsRepository();
    mockSessionsRepository = createMockSessionsRepository();

    mockBingoModule = {
      cardsService: new CardsService(mockCardsRepository, mockCellsRepository),
      cellsService: new CellsService(mockCellsRepository),
      sessionsService: new SessionsService(mockSessionsRepository),
      cardsRepository: mockCardsRepository,
      cellsRepository: mockCellsRepository,
      sessionsRepository: mockSessionsRepository,
    };

    setBingoModule(mockBingoModule);
  });

  afterEach(() => {
    resetBingoModule();
    vi.clearAllMocks();
  });

  describe('GET /api/sessions/:sessionId/cards', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const { GET } = await import('../../../../app/api/sessions/[sessionId]/cards/route');

      const request = new NextRequest('http://localhost/api/sessions/session-123/cards');
      const response = await GET(request, {
        params: Promise.resolve({ sessionId: 'session-123' }),
      });

      expect(response.status).toBe(401);
    });

    it('should return 404 for invalid session ID', async () => {
      const { GET } = await import('../../../../app/api/sessions/[sessionId]/cards/route');

      const request = createAuthenticatedRequest(
        'http://localhost/api/sessions/invalid-id/cards'
      );
      const response = await GET(request, {
        params: Promise.resolve({ sessionId: 'invalid-id' }),
      });

      expect(response.status).toBe(404);
    });

    it('should return 404 when session does not exist', async () => {
      const { GET } = await import('../../../../app/api/sessions/[sessionId]/cards/route');

      vi.mocked(mockSessionsRepository.findById).mockResolvedValue(null);

      const request = createAuthenticatedRequest(
        'http://localhost/api/sessions/550e8400-e29b-41d4-a716-446655440000/cards'
      );
      const response = await GET(request, {
        params: Promise.resolve({ sessionId: '550e8400-e29b-41d4-a716-446655440000' }),
      });

      expect(response.status).toBe(404);
    });

    it('should return 403 when user is not a session member', async () => {
      const { GET } = await import('../../../../app/api/sessions/[sessionId]/cards/route');

      vi.mocked(mockSessionsRepository.findById).mockResolvedValue(createMockSession());
      vi.mocked(mockSessionsRepository.findPlayerByUserAndSession).mockResolvedValue(null);

      const request = createAuthenticatedRequest(
        'http://localhost/api/sessions/550e8400-e29b-41d4-a716-446655440000/cards'
      );
      const response = await GET(request, {
        params: Promise.resolve({ sessionId: '550e8400-e29b-41d4-a716-446655440000' }),
      });

      expect(response.status).toBe(403);
    });

    it('should return cards when user is a session member', async () => {
      const { GET } = await import('../../../../app/api/sessions/[sessionId]/cards/route');

      const mockSessionPlayer = createMockSessionPlayer();
      const mockCard = createMockCard();
      const mockCells = [
        createMockCell({ index: 0 }),
        createMockCell({ index: 1 }),
      ];

      vi.mocked(mockSessionsRepository.findById).mockResolvedValue(createMockSession());
      vi.mocked(mockSessionsRepository.findPlayerByUserAndSession).mockResolvedValue(mockSessionPlayer);
      vi.mocked(mockCardsRepository.findBySessionPlayerId).mockResolvedValue([
        { ...mockCard, cells: mockCells },
      ]);

      const request = createAuthenticatedRequest(
        'http://localhost/api/sessions/550e8400-e29b-41d4-a716-446655440000/cards'
      );
      const response = await GET(request, {
        params: Promise.resolve({ sessionId: '550e8400-e29b-41d4-a716-446655440000' }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(data.cards).toHaveLength(1);
    });
  });

  describe('GET /api/cards', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const { GET } = await import('../../../../app/api/cards/route');

      const request = new NextRequest('http://localhost/api/cards');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-premium users', async () => {
      const { GET } = await import('../../../../app/api/cards/route');

      const request = createAuthenticatedRequest(
        'http://localhost/api/cards',
        {},
        'user-123',
        'test@example.com',
        'FREE'
      );
      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    it('should return cards for premium users', async () => {
      const { GET } = await import('../../../../app/api/cards/route');

      const mockCard = createMockCard({ sessionPlayerId: null, source: 'SCANNED' as CardSource });
      vi.mocked(mockCardsRepository.findStandaloneByUserId).mockResolvedValue([
        { ...mockCard, cells: [] },
      ]);

      const request = createAuthenticatedRequest(
        'http://localhost/api/cards',
        {},
        'user-123',
        'test@example.com',
        'PREMIUM'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.cards).toHaveLength(1);
    });
  });

  describe('GET /api/cards/:cardId', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const { GET } = await import('../../../../app/api/cards/[cardId]/route');

      const request = new NextRequest('http://localhost/api/cards/card-123');
      const response = await GET(request, {
        params: Promise.resolve({ cardId: 'card-123' }),
      });

      expect(response.status).toBe(401);
    });

    it('should return 404 for invalid card ID', async () => {
      const { GET } = await import('../../../../app/api/cards/[cardId]/route');

      const request = createAuthenticatedRequest('http://localhost/api/cards/invalid-id');
      const response = await GET(request, {
        params: Promise.resolve({ cardId: 'invalid-id' }),
      });

      expect(response.status).toBe(404);
    });

    it('should return card details when user owns the card', async () => {
      const { GET } = await import('../../../../app/api/cards/[cardId]/route');

      const mockCard = createMockCard();
      const mockCells = [createMockCell()];
      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: mockCells,
      });

      const request = createAuthenticatedRequest(
        'http://localhost/api/cards/550e8400-e29b-41d4-a716-446655440000'
      );
      const response = await GET(request, {
        params: Promise.resolve({ cardId: '550e8400-e29b-41d4-a716-446655440000' }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.id).toBe('card-123');
      expect(data.cells).toHaveLength(1);
    });
  });

  describe('PATCH /api/cards/:cardId/cells/:cellIndex', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const { PATCH } = await import('../../../../app/api/cards/[cardId]/cells/[cellIndex]/route');

      const request = new NextRequest('http://localhost/api/cards/card-123/cells/0', {
        method: 'PATCH',
        body: JSON.stringify({ marked: true }),
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ cardId: 'card-123', cellIndex: '0' }),
      });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid request body', async () => {
      const { PATCH } = await import('../../../../app/api/cards/[cardId]/cells/[cellIndex]/route');

      const request = createAuthenticatedRequest(
        'http://localhost/api/cards/550e8400-e29b-41d4-a716-446655440000/cells/0',
        {
          method: 'PATCH',
          body: JSON.stringify({ invalid: true }),
        }
      );
      const response = await PATCH(request, {
        params: Promise.resolve({ cardId: '550e8400-e29b-41d4-a716-446655440000', cellIndex: '0' }),
      });

      expect(response.status).toBe(400);
    });

    it('should mark a cell successfully', async () => {
      const { PATCH } = await import('../../../../app/api/cards/[cardId]/cells/[cellIndex]/route');

      const mockCard = createMockCard();
      const mockCell = createMockCell({ marked: false });

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: [mockCell],
      });
      vi.mocked(mockCellsRepository.findByCardIdAndIndex).mockResolvedValue(mockCell);
      vi.mocked(mockCellsRepository.updateMarkedStatus).mockResolvedValue({
        ...mockCell,
        marked: true,
      });

      const request = createAuthenticatedRequest(
        'http://localhost/api/cards/550e8400-e29b-41d4-a716-446655440000/cells/0',
        {
          method: 'PATCH',
          body: JSON.stringify({ marked: true }),
        }
      );
      const response = await PATCH(request, {
        params: Promise.resolve({ cardId: '550e8400-e29b-41d4-a716-446655440000', cellIndex: '0' }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.marked).toBe(true);
    });

    it('should return 400 when trying to unmark a free space', async () => {
      const { PATCH } = await import('../../../../app/api/cards/[cardId]/cells/[cellIndex]/route');

      const mockCard = createMockCard();
      const mockCell = createMockCell({ type: 'FREE' as CellType, marked: true, value: null });

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: [mockCell],
      });
      vi.mocked(mockCellsRepository.findByCardIdAndIndex).mockResolvedValue(mockCell);

      const request = createAuthenticatedRequest(
        'http://localhost/api/cards/550e8400-e29b-41d4-a716-446655440000/cells/0',
        {
          method: 'PATCH',
          body: JSON.stringify({ marked: false }),
        }
      );
      const response = await PATCH(request, {
        params: Promise.resolve({ cardId: '550e8400-e29b-41d4-a716-446655440000', cellIndex: '0' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/cards/:cardId/cells/bulk', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const { PATCH } = await import('../../../../app/api/cards/[cardId]/cells/bulk/route');

      const request = new NextRequest('http://localhost/api/cards/card-123/cells/bulk', {
        method: 'PATCH',
        body: JSON.stringify({ cells: [{ index: 0, marked: true }] }),
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ cardId: 'card-123' }),
      });

      expect(response.status).toBe(401);
    });

    it('should bulk update cells successfully', async () => {
      const { PATCH } = await import('../../../../app/api/cards/[cardId]/cells/bulk/route');

      const mockCard = createMockCard();
      const mockCells = [
        createMockCell({ index: 0, marked: false }),
        createMockCell({ index: 1, marked: false }),
      ];

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: mockCells,
      });
      vi.mocked(mockCellsRepository.bulkUpdateMarkedStatus).mockResolvedValue([
        { ...mockCells[0]!, marked: true },
        { ...mockCells[1]!, marked: true },
      ]);

      const request = createAuthenticatedRequest(
        'http://localhost/api/cards/550e8400-e29b-41d4-a716-446655440000/cells/bulk',
        {
          method: 'PATCH',
          body: JSON.stringify({
            cells: [
              { index: 0, marked: true },
              { index: 1, marked: true },
            ],
          }),
        }
      );
      const response = await PATCH(request, {
        params: Promise.resolve({ cardId: '550e8400-e29b-41d4-a716-446655440000' }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.updatedCells).toHaveLength(2);
    });
  });
});
